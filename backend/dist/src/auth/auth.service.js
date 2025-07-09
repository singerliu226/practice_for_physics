"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_service_1 = require("../common/logger/logger.service");
const email_service_1 = require("../common/email/email.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, logger, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = logger;
        this.emailService = emailService;
    }
    async register(name, email, password, role = client_1.UserRole.STUDENT) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('用户邮箱已存在');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        this.logger.log(`New user registered: ${email}`, 'AuthService');
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user,
            ...tokens,
        };
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        this.logger.log(`User logged in: ${email}`, 'AuthService');
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
            ...tokens,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('用户不存在');
            }
            const tokens = await this.generateTokens(user.id, user.email, user.role);
            return tokens;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('无效的刷新令牌');
        }
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                student: true,
                teacher: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        return user;
    }
    async sendResetCode(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            this.logger.warn(`Forgot password for non-existing email: ${email}`, 'AuthService');
            return { message: '若邮箱存在，我们已发送验证码' };
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.passwordResetCode.upsert({
            where: { email },
            update: { code, expiresAt },
            create: { email, code, expiresAt },
        });
        await this.emailService.send(email, '物理刷题网 - 密码重置验证码', `您的验证码为 ${code}，10 分钟内有效。若非本人操作，请忽略此邮件。`);
        this.logger.log(`发送重置验证码 ${code} → ${email}`, 'AuthService');
        return { message: '验证码已发送，请检查邮箱' };
    }
    async resetPassword(email, code, newPassword) {
        const record = await this.prisma.passwordResetCode.findUnique({ where: { email } });
        if (!record || record.code !== code || record.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('验证码无效或已过期');
        }
        const hashed = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { email },
            data: { password: hashed },
        });
        await this.prisma.passwordResetCode.delete({ where: { email } });
        this.logger.log(`Password reset for ${email}`, 'AuthService');
        return { message: '密码已重置，请使用新密码登录' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        logger_service_1.LoggerService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
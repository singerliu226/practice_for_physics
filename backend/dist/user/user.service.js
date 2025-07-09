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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_service_1 = require("../common/logger/logger.service");
let UserService = class UserService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                student: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                        avatar: true,
                        totalAnswered: true,
                        correctAnswered: true,
                        currentChapter: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        subject: true,
                        avatar: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                student: true,
                teacher: true,
            },
        });
    }
    async updateUser(id, data) {
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data,
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    role: true,
                    updatedAt: true,
                },
            });
            this.logger.log(`User updated: ${id}`, 'UserService');
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`Failed to update user: ${id}`, error, 'UserService');
            throw error;
        }
    }
    async deleteUser(id) {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
            this.logger.log(`User deleted: ${id}`, 'UserService');
            return { message: '用户删除成功' };
        }
        catch (error) {
            this.logger.error(`Failed to delete user: ${id}`, error, 'UserService');
            throw error;
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logger_service_1.LoggerService])
], UserService);
//# sourceMappingURL=user.service.js.map
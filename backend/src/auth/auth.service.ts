import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { EmailService } from '../common/email/email.service';
import { UserRole } from '@prisma/client';

/**
 * 认证服务
 * 处理用户注册、登录、JWT 令牌生成和验证
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * 用户注册
   */
  async register(name: string, email: string, password: string, role: UserRole = UserRole.STUDENT) {
    // 检查用户是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('用户邮箱已存在');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
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

    // 生成 JWT 令牌
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * 用户登录
   */
  async login(email: string, password: string) {
    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    this.logger.log(`User logged in: ${email}`, 'AuthService');

    // 生成 JWT 令牌
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

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 生成新的令牌对
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  /**
   * 生成 Access Token 和 Refresh Token
   */
  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // Refresh token 有效期
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 验证用户（用于 JWT 策略）
   */
  async validateUser(userId: string) {
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
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  // ------------------ 忘记密码流程 ------------------
  /**
   * 发送重置验证码到用户邮箱（此处仅打印日志）
   */
  async sendResetCode(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // 无论用户是否存在，都返回成功，防止枚举账户
    if (!user) {
      this.logger.warn(`Forgot password for non-existing email: ${email}`, 'AuthService');
      return { message: '若邮箱存在，我们已发送验证码' };
    }

    // 生成 6 位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 写入 / 更新数据库记录
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分钟
    await this.prisma.passwordResetCode.upsert({
      where: { email },
      update: { code, expiresAt },
      create: { email, code, expiresAt },
    });

    // 发送邮件
    await this.emailService.send(
      email,
      '物理刷题网 - 密码重置验证码',
      `您的验证码为 ${code}，10 分钟内有效。若非本人操作，请忽略此邮件。`,
    );

    this.logger.log(`发送重置验证码 ${code} → ${email}`, 'AuthService');
    return { message: '验证码已发送，请检查邮箱' };
  }

  /**
   * 验证码重设密码
   */
  async resetPassword(email: string, code: string, newPassword: string) {
    const record = await this.prisma.passwordResetCode.findUnique({ where: { email } });
    if (!record || record.code !== code || record.expiresAt < new Date()) {
      throw new UnauthorizedException('验证码无效或已过期');
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
} 
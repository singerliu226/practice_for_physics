import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from '../common/email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PublicGuard } from './guards/public.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * 认证模块
 * 提供用户注册、登录、JWT 令牌管理和权限控制
 */
@Module({
  imports: [
    EmailModule,
    // 注册 passport，并设置默认策略为 jwt，确保 AuthGuard('jwt') 可用
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        // 仅在配置存在且不为 "undefined" 空串时才设置 secret，避免误把字符串 "undefined" 当密钥
        return {
          ...(secret && secret !== 'undefined' && secret.trim() !== '' ? { secret } : {}),
          signOptions: {
            expiresIn: '24h', // Access token 有效期
          },
        } as any;
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RoleGuard, PublicGuard, JwtStrategy],
  exports: [AuthService, JwtAuthGuard, RoleGuard, PublicGuard, JwtStrategy],
})
export class AuthModule {} 
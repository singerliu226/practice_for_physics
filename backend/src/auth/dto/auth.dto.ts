import { IsEmail, IsString, MinLength, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';

/**
 * 用户注册 DTO
 */
export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString({ message: '姓名必须是字符串' })
  @MinLength(2, { message: '姓名至少2个字符' })
  @MaxLength(20, { message: '姓名不能超过20个字符' })
  name: string;

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少为6位' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: '用户角色必须是 STUDENT 或 TEACHER' })
  role?: UserRole = UserRole.STUDENT;
}

/**
 * 用户登录 DTO
 */
export class LoginDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString({ message: '密码必须是字符串' })
  password: string;
}

/**
 * 刷新令牌 DTO
 */
export class RefreshTokenDto {
  @IsString({ message: '刷新令牌必须是字符串' })
  refreshToken: string;
}

/**
 * 忘记密码 DTO
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;
}

/**
 * 重设密码 DTO
 */
export class ResetPasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString({ message: '验证码必须是字符串' })
  verificationCode: string;

  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少为6位' })
  newPassword: string;
} 
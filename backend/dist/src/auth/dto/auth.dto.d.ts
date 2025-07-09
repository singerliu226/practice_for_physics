import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    email: string;
    verificationCode: string;
    newPassword: string;
}

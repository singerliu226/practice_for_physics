import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { EmailService } from '../common/email/email.service';
import { UserRole } from '@prisma/client';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    private readonly emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, logger: LoggerService, emailService: EmailService);
    register(name: string, email: string, password: string, role?: UserRole): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
    validateUser(userId: string): Promise<{
        student: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            grade: string;
            classId: string | null;
            avatar: string | null;
            totalAnswered: number;
            correctAnswered: number;
            currentChapter: string | null;
        };
        teacher: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            avatar: string | null;
            subject: string;
        };
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    sendResetCode(email: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, code: string, newPassword: string): Promise<{
        message: string;
    }>;
}

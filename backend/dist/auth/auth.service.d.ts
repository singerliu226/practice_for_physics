import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { UserRole } from '@prisma/client';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, logger: LoggerService);
    register(email: string, password: string, role?: UserRole): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            createdAt: Date;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
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
        teacher: {
            id: string;
            userId: string;
            name: string;
            subject: string;
            avatar: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        student: {
            id: string;
            userId: string;
            name: string;
            avatar: string | null;
            createdAt: Date;
            updatedAt: Date;
            grade: string;
            classId: string | null;
            totalAnswered: number;
            correctAnswered: number;
            currentChapter: string | null;
        };
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}

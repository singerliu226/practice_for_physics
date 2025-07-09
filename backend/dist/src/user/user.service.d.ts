import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
export declare class UserService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: LoggerService);
    findById(id: string): Promise<{
        student: {
            id: string;
            name: string;
            grade: string;
            avatar: string;
            totalAnswered: number;
            correctAnswered: number;
            currentChapter: string;
        };
        teacher: {
            id: string;
            name: string;
            avatar: string;
            subject: string;
        };
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
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
        createdAt: Date;
    }>;
    updateUser(id: string, data: {
        email?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}

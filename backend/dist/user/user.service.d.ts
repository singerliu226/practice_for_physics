import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
export declare class UserService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: LoggerService);
    findById(id: string): Promise<{
        teacher: {
            id: string;
            name: string;
            subject: string;
            avatar: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        student: {
            id: string;
            name: string;
            avatar: string;
            grade: string;
            totalAnswered: number;
            correctAnswered: number;
            currentChapter: string;
        };
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findByEmail(email: string): Promise<{
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
        createdAt: Date;
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
    updateUser(id: string, data: {
        email?: string;
        phone?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}

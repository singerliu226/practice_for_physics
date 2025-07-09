import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
export declare class TeacherService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: LoggerService);
    createTeacher(userId: string, data: {
        name: string;
        subject?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string;
        avatar: string | null;
        subject: string;
    }>;
}

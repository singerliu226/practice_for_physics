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
        userId: string;
        name: string;
        subject: string;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
export declare class StudentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: LoggerService);
    createStudent(userId: string, data: {
        name: string;
        grade: string;
        classId?: string;
    }): Promise<{
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
    }>;
}

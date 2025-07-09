import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';
import { DocxParserService } from './docx-parser.service';
export declare class QuestionBankService {
    private readonly prisma;
    private readonly logger;
    private readonly docxParser;
    constructor(prisma: PrismaService, logger: LoggerService, docxParser: DocxParserService);
    createQuestion(data: CreateQuestionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        answer: string;
        explanation: string | null;
        chapter: string;
        section: string | null;
        difficulty: number;
        tags: string[];
        totalAttempts: number;
        correctAttempts: number;
    }>;
    getRandomQuestions(count: number, chapter?: string, difficulty?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        answer: string;
        explanation: string | null;
        chapter: string;
        section: string | null;
        difficulty: number;
        tags: string[];
        totalAttempts: number;
        correctAttempts: number;
    }[]>;
    getQuestionById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        answer: string;
        explanation: string | null;
        chapter: string;
        section: string | null;
        difficulty: number;
        tags: string[];
        totalAttempts: number;
        correctAttempts: number;
    }>;
    listChapters(): Promise<{
        name: string;
        questionCount: number;
    }[]>;
    listQuestions(query: QueryQuestionDto): Promise<{
        total: number;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            options: import("@prisma/client/runtime/library").JsonValue | null;
            answer: string;
            explanation: string | null;
            chapter: string;
            section: string | null;
            difficulty: number;
            tags: string[];
            totalAttempts: number;
            correctAttempts: number;
        }[];
    }>;
    updateQuestion(id: string, data: UpdateQuestionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        answer: string;
        explanation: string | null;
        chapter: string;
        section: string | null;
        difficulty: number;
        tags: string[];
        totalAttempts: number;
        correctAttempts: number;
    }>;
    deleteQuestion(id: string): Promise<{
        id: string;
    }>;
    importFromDocx(fileBuffer: Buffer, chapter: string, difficulty: number): Promise<{
        imported: number;
    }>;
}

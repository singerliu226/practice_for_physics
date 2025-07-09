import { QuestionBankService } from './questionbank.service';
import { CreateQuestionDto as NewCreateQuestionDto } from './dto/create-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionBankController {
    private readonly questionBankService;
    constructor(questionBankService: QuestionBankService);
    createQuestion(createQuestionDto: NewCreateQuestionDto): Promise<{
        chapter: string;
        id: string;
        title: string;
        content: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        answer: string;
        explanation: string | null;
        section: string | null;
        difficulty: number;
        tags: string[];
        totalAttempts: number;
        correctAttempts: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getRandomQuestions(count?: number): Promise<{
        chapter: string;
        id: string;
        title: string;
        content: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        answer: string;
        explanation: string | null;
        section: string | null;
        difficulty: number;
        tags: string[];
        totalAttempts: number;
        correctAttempts: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    listQuestions(query: QueryQuestionDto): Promise<{
        total: number;
        data: {
            chapter: string;
            id: string;
            title: string;
            content: string;
            options: import("@prisma/client/runtime/library").JsonValue | null;
            answer: string;
            explanation: string | null;
            section: string | null;
            difficulty: number;
            tags: string[];
            totalAttempts: number;
            correctAttempts: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    listChapters(): Promise<{
        name: string;
        questionCount: number;
    }[]>;
    getQuestionById(id: string): Promise<{
        chapter: string;
        id: string;
        title: string;
        content: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        answer: string;
        explanation: string | null;
        section: string | null;
        difficulty: number;
        tags: string[];
        totalAttempts: number;
        correctAttempts: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateQuestion(id: string, data: UpdateQuestionDto): Promise<{
        chapter: string;
        id: string;
        title: string;
        content: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        answer: string;
        explanation: string | null;
        section: string | null;
        difficulty: number;
        tags: string[];
        totalAttempts: number;
        correctAttempts: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteQuestion(id: string): Promise<{
        id: string;
    }>;
    importQuestions(file: Express.Multer.File, chapter: string, difficulty: number): Promise<{
        imported: number;
    }>;
}

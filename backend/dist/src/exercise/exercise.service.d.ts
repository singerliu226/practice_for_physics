import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { QuestionBankService } from '../questionbank/questionbank.service';
import { StartExerciseDto } from './dto/start-exercise.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
export interface ExerciseSession {
    sessionId: string;
    questions: any[];
    totalCount: number;
    mode: string;
    startTime: Date;
}
export declare class ExerciseService {
    private readonly prisma;
    private readonly questionBank;
    private readonly logger;
    constructor(prisma: PrismaService, questionBank: QuestionBankService, logger: LoggerService);
    startExercise(studentId: string, dto: StartExerciseDto): Promise<ExerciseSession>;
    submitAnswer(studentId: string, dto: SubmitAnswerDto): Promise<{
        isCorrect: boolean;
        correctAnswer: string;
        explanation: string;
    }>;
    getStudentStats(studentId: string): Promise<{
        totalAnswered: number;
        correctAnswered: number;
        accuracy: number;
        recentActivity: number;
        chapterStats: {
            chapter: string;
            total: number;
            correct: number;
            accuracy: number;
        }[];
    }>;
    getWrongQuestions(studentId: string, limit?: number): Promise<{
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
    markWrongQuestionResolved(studentId: string, questionId: string): Promise<void>;
}

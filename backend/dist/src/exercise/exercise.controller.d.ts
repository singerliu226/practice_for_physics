import { ExerciseService } from './exercise.service';
import { StartExerciseDto } from './dto/start-exercise.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
export declare class ExerciseController {
    private readonly exerciseService;
    constructor(exerciseService: ExerciseService);
    getStudentStats(req: any): Promise<{
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
    startExercise(req: any, startDto: StartExerciseDto): Promise<import("./exercise.service").ExerciseSession>;
    submitAnswer(req: any, submitDto: SubmitAnswerDto): Promise<{
        isCorrect: boolean;
        correctAnswer: string;
        explanation: string;
    }>;
    getWrongQuestions(req: any, limit?: number): Promise<{
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
    markWrongQuestionResolved(req: any, questionId: string): Promise<{
        success: boolean;
    }>;
}

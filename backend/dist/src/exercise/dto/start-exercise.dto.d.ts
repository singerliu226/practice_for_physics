export declare class StartExerciseDto {
    mode: 'random' | 'chapter' | 'wrong' | 'difficulty';
    chapter?: string;
    difficulty?: number;
    count?: number;
}

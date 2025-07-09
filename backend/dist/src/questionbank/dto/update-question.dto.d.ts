import { CreateQuestionDto } from './create-question.dto';
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U2> ? ReadonlyArray<DeepPartial<U2>> : T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export declare class UpdateQuestionDto implements DeepPartial<CreateQuestionDto> {
    title?: string;
    content?: string;
    options?: string[];
    answer?: string;
    explanation?: string;
    chapter?: string;
    section?: string;
    difficulty?: number;
    tags?: string[];
}
export {};

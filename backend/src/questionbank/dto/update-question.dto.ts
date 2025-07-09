import { CreateQuestionDto } from './create-question.dto';

/**
 * 将 T 中所有属性设为可选
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U2>
    ? ReadonlyArray<DeepPartial<U2>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

/**
 * DTO: 更新题目
 * 基于 CreateQuestionDto 的深度可选版本
 */
export class UpdateQuestionDto implements DeepPartial<CreateQuestionDto> {
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
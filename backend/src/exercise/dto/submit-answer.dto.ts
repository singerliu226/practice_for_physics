import { IsString, IsOptional, IsInt, Min } from 'class-validator';

/**
 * 提交答案请求 DTO
 */
export class SubmitAnswerDto {
  /** 题目 ID */
  @IsString()
  questionId: string;

  /** 学生答案 */
  @IsString()
  answer: string;

  /** 作答耗时（秒） */
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpent?: number;
} 
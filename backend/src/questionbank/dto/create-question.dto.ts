import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, Max, ArrayNotEmpty } from 'class-validator';

/**
 * DTO: 创建题目
 * 使用 class-validator 进行输入数据校验
 */
export class CreateQuestionDto {
  /** 题目标题 */
  @IsString()
  @IsNotEmpty()
  title: string;

  /** 题目内容（支持 Markdown/HTML） */
  @IsString()
  @IsNotEmpty()
  content: string;

  /** 选项（选择题可选） */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  options?: string[];

  /** 正确答案 */
  @IsString()
  @IsNotEmpty()
  answer: string;

  /** 答案解析 */
  @IsOptional()
  @IsString()
  explanation?: string;

  /** 所属章节 */
  @IsString()
  @IsNotEmpty()
  chapter: string;

  /** 所属小节 */
  @IsOptional()
  @IsString()
  section?: string;

  /** 难度 1-5 */
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;

  /** 自定义标签 */
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags: string[];
} 
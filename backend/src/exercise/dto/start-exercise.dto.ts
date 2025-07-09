import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

/**
 * 开始练习请求 DTO
 * 由于项目全局启用了 ValidationPipe(whitelist:true, forbidNonWhitelisted:true)，
 * 若缺少校验装饰器会导致所有属性被视为“非白名单”字段而直接抛出 400。
 * 因此必须为每个可接受的字段添加显式的验证规则。
 */
export class StartExerciseDto {
  /** 练习模式 */
  @IsEnum(['random', 'chapter', 'wrong', 'difficulty'])
  mode: 'random' | 'chapter' | 'wrong' | 'difficulty';

  /** 所属章节（mode 为 chapter 时可选；后端会自行校验必填逻辑） */
  @IsOptional()
  @IsString()
  chapter?: string;

  /** 题目难度（mode 为 difficulty 时可选；后端校验） */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  difficulty?: number;

  /** 题目数量，默认 10，范围 1~100 */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number;
} 
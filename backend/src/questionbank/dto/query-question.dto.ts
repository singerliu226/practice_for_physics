import { IsInt, IsOptional, IsString, Min, Max, IsArray, ArrayNotEmpty } from 'class-validator';

/**
 * DTO: 查询题目
 * 用于列表分页筛选
 */
export class QueryQuestionDto {
  /** 页码，默认 1 */
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  /** 每页数量，默认 10，最大 100 */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  /** 按章节过滤 */
  @IsOptional()
  @IsString()
  chapter?: string;

  /** 按难度过滤 1-5 */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  /** 标签过滤，至少一个 */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  /** 按关键字搜索（标题或内容） */
  @IsOptional()
  @IsString()
  keyword?: string;
} 
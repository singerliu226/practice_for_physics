import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';
import { DocxParserService } from './docx-parser.service';

@Injectable()
export class QuestionBankService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly docxParser: DocxParserService,
  ) {}

  async createQuestion(data: CreateQuestionDto) {
    const question = await this.prisma.question.create({
      data: {
        title: data.title,
        content: data.content,
        options: data.options || null,
        answer: data.answer,
        explanation: data.explanation,
        chapter: data.chapter,
        section: data.section,
        difficulty: data.difficulty,
        tags: data.tags,
      },
    });

    this.logger.log(`Question created: ${question.id}`, 'QuestionBankService');
    return question;
  }

  async getRandomQuestions(count: number, chapter?: string, difficulty?: number) {
    const whereCondition: any = {};
    if (chapter) whereCondition.chapter = chapter;
    if (difficulty) whereCondition.difficulty = difficulty;

    const total = await this.prisma.question.count({ where: whereCondition });
    if (total === 0) return [];

    const randomSkip = Math.floor(Math.random() * Math.max(0, total - count));
    return this.prisma.question.findMany({
      where: whereCondition,
      skip: randomSkip,
      take: count,
    });
  }

  async getQuestionById(id: string) {
    return this.prisma.question.findUnique({ where: { id } });
  }

  /**
   * 获取题库中已有的章节列表
   */
  async listChapters(): Promise<{ name: string; questionCount: number }[]> {
    const grouped = await this.prisma.question.groupBy({
      by: ['chapter'],
      _count: { chapter: true },
      orderBy: { chapter: 'asc' },
    });
    return grouped.map((g) => ({ name: g.chapter, questionCount: g._count.chapter }));
  }

  /**
   * 列出题目（支持分页及过滤）
   */
  async listQuestions(query: QueryQuestionDto) {
    const {
      page = 1,
      pageSize = 10,
      chapter,
      difficulty,
      tags,
      keyword,
    } = query;

    const where: any = {};
    if (chapter) where.chapter = chapter;
    if (typeof difficulty !== 'undefined') where.difficulty = difficulty;
    if (tags && tags.length) where.tags = { hasSome: tags };
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, data };
  }

  /**
   * 更新题目
   */
  async updateQuestion(id: string, data: UpdateQuestionDto) {
    const updated = await this.prisma.question.update({
      where: { id },
      data,
    });
    this.logger.log(`Question updated: ${id}`, 'QuestionBankService');
    return updated;
  }

  /**
   * 删除题目
   */
  async deleteQuestion(id: string) {
    await this.prisma.question.delete({ where: { id } });
    this.logger.warn(`Question deleted: ${id}`, 'QuestionBankService');
    return { id };
  }

  /**
   * 通过 Docx 导入题目
   */
  async importFromDocx(fileBuffer: Buffer, chapter: string, difficulty: number) {
    const questions = await this.docxParser.parseQuestionsFromDocx(
      fileBuffer,
      chapter,
      difficulty,
    );

    if (!questions.length) {
      this.logger.warn('DOCX 中未解析到题目', 'QuestionBankService');
      return { imported: 0 };
    }

    await this.prisma.question.createMany({ data: questions });
    this.logger.log(`Imported ${questions.length} questions`, 'QuestionBankService');
    return { imported: questions.length };
  }
}

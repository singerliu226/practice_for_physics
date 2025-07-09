import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { DocxParserService } from './docx-parser.service';
import { Module } from '@nestjs/common';
import { QuestionBankController } from './questionbank.controller';

export interface CreateQuestionDto {
  title: string;
  content: string;
  options?: string[];
  answer: string;
  explanation?: string;
  chapter: string;
  section?: string;
  difficulty: number;
  tags: string[];
}

/**
 * 题库服务
 * 处理题目的 CRUD 操作、Word 文档导入和知识点管理
 */
@Injectable()
export class QuestionBankService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly docxParser: DocxParserService,
  ) {}

  /**
   * 创建题目
   */
  async createQuestion(data: CreateQuestionDto) {
    try {
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

      this.logger.log(
        `Question created: ${question.id} in chapter ${data.chapter}`,
        'QuestionBankService',
      );

      return question;
    } catch (error) {
      this.logger.error(
        `Failed to create question: ${error.message}`,
        error.stack,
        'QuestionBankService',
      );
      throw error;
    }
  }

  /**
   * 根据章节获取题目列表
   */
  async getQuestionsByChapter(chapter: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where: { chapter },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.question.count({
        where: { chapter },
      }),
    ]);

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 根据难度获取题目
   */
  async getQuestionsByDifficulty(difficulty: number, chapter?: string) {
    const whereCondition: any = { difficulty };
    if (chapter) {
      whereCondition.chapter = chapter;
    }

    return this.prisma.question.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 随机获取题目（用于练习）
   */
  async getRandomQuestions(count: number, chapter?: string, difficulty?: number) {
    const whereCondition: any = {};
    if (chapter) whereCondition.chapter = chapter;
    if (difficulty) whereCondition.difficulty = difficulty;

    // 先获取符合条件的题目总数
    const total = await this.prisma.question.count({ where: whereCondition });
    
    if (total === 0) {
      return [];
    }

    // 随机选择起始位置
    const randomSkip = Math.floor(Math.random() * Math.max(0, total - count));

    return this.prisma.question.findMany({
      where: whereCondition,
      skip: randomSkip,
      take: count,
    });
  }

  /**
   * 从 DOCX 文件导入题目
   */
  async importFromDocx(file: Buffer, chapter: string, difficulty: number) {
    try {
      const questions = await this.docxParser.parseQuestionsFromDocx(file, chapter, difficulty);
      
      const createdQuestions = [];
      for (const questionData of questions) {
        const question = await this.createQuestion(questionData);
        createdQuestions.push(question);
      }

      this.logger.log(
        `Imported ${createdQuestions.length} questions from DOCX for chapter: ${chapter}`,
        'QuestionBankService',
      );

      return {
        importedCount: createdQuestions.length,
        questions: createdQuestions,
      };
    } catch (error) {
      this.logger.error(
        `Failed to import DOCX: ${error.message}`,
        error.stack,
        'QuestionBankService',
      );
      throw new BadRequestException(`导入失败: ${error.message}`);
    }
  }

  /**
   * 获取所有章节列表
   */
  async getChapters() {
    const chapters = await this.prisma.question.groupBy({
      by: ['chapter'],
      _count: {
        chapter: true,
      },
      orderBy: {
        chapter: 'asc',
      },
    });

    return chapters.map(item => ({
      name: item.chapter,
      questionCount: item._count.chapter,
    }));
  }

  /**
   * 获取题目详情
   */
  async getQuestionById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    return question;
  }

  /**
   * 更新题目
   */
  async updateQuestion(id: string, data: Partial<CreateQuestionDto>) {
    try {
      const updatedQuestion = await this.prisma.question.update({
        where: { id },
        data,
      });

      this.logger.log(`Question updated: ${id}`, 'QuestionBankService');
      return updatedQuestion;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('题目不存在');
      }
      throw error;
    }
  }

  /**
   * 删除题目
   */
  async deleteQuestion(id: string) {
    try {
      await this.prisma.question.delete({
        where: { id },
      });

      this.logger.log(`Question deleted: ${id}`, 'QuestionBankService');
      return { message: '题目删除成功' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('题目不存在');
      }
      throw error;
    }
  }
}

/**
 * 题库模块
 * 提供题目管理、Word文档导入和知识点分析功能
 */
@Module({
  controllers: [QuestionBankController],
  providers: [QuestionBankService, DocxParserService],
  exports: [QuestionBankService],
})
export class QuestionBankModule {} 
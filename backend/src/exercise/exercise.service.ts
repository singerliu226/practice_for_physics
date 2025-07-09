import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { QuestionBankService } from '../questionbank/questionbank.service';
import { StartExerciseDto } from './dto/start-exercise.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { randomUUID } from 'crypto';

export interface ExerciseSession {
  sessionId: string;
  questions: any[];
  totalCount: number;
  mode: string;
  startTime: Date;
}

/**
 * 练习相关业务逻辑
 */
@Injectable()
export class ExerciseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionBank: QuestionBankService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 开始一次练习
   *
   * @param studentId 学生ID
   * @param dto       练习配置
   */
  async startExercise(studentId: string, dto: StartExerciseDto): Promise<ExerciseSession> {
    const { mode, chapter, difficulty, count = 10 } = dto;

    let questions: any[] = [];

    switch (mode) {
      case 'chapter': {
        questions = await this.questionBank.getRandomQuestions(count, chapter, undefined);
        break;
      }
      case 'difficulty': {
        questions = await this.questionBank.getRandomQuestions(count, undefined, difficulty);
        break;
      }
      case 'wrong': {
        questions = await this.getWrongQuestions(studentId, count);
        break;
      }
      case 'random':
      default: {
        questions = await this.questionBank.getRandomQuestions(count);
        break;
      }
    }

    this.logger.log(`Student ${studentId} started exercise, mode=${mode}, count=${questions.length}`, 'ExerciseService');

    return {
      sessionId: randomUUID(),
      questions,
      totalCount: questions.length,
      mode,
      startTime: new Date(),
    };
  }

  /**
   * 提交答案
   */
  async submitAnswer(studentId: string, dto: SubmitAnswerDto) {
    try {
      const question = await this.prisma.question.findUnique({ where: { id: dto.questionId } });
      if (!question) {
        throw new Error('题目不存在');
      }

      const isCorrect = dto.answer.trim() === question.answer.trim();

      // 创建作答记录
      await this.prisma.exerciseRecord.create({
        data: {
          studentId,
          questionId: question.id,
          answer: dto.answer,
          isCorrect,
          timeSpent: dto.timeSpent || null,
        },
      });

      // 更新题目统计
      await this.prisma.question.update({
        where: { id: question.id },
        data: {
          totalAttempts: { increment: 1 },
          correctAttempts: { increment: isCorrect ? 1 : 0 },
        },
      });

      // 更新学生统计
      await this.prisma.student.update({
        where: { id: studentId },
        data: {
          totalAnswered: { increment: 1 },
          correctAnswered: { increment: isCorrect ? 1 : 0 },
        },
      });

      // 错题处理
      if (!isCorrect) {
        // Upsert wrong question
        await this.prisma.wrongQuestion.upsert({
          where: {
            studentId_questionId: {
              studentId,
              questionId: question.id,
            },
          },
          update: {
            wrongAnswer: dto.answer,
            reviewCount: { increment: 1 },
            isResolved: false,
          },
          create: {
            studentId,
            questionId: question.id,
            wrongAnswer: dto.answer,
          },
        });
      }

      this.logger.log(
        `Student ${studentId} submitted answer for question ${question.id} (${isCorrect ? 'correct' : 'wrong'})`,
        'ExerciseService',
      );

      return {
        isCorrect,
        correctAnswer: question.answer,
        explanation: question.explanation,
      };
    } catch (error) {
      this.logger.error(`Failed to submit answer: ${(error as Error).message}`, (error as Error).stack, 'ExerciseService');
      throw error;
    }
  }

  /**
   * 获取学生学习统计
   */
  async getStudentStats(studentId: string) {
    // 总答题 / 正确
    const [totalAnswered, correctAnswered] = await Promise.all([
      this.prisma.exerciseRecord.count({ where: { studentId } }),
      this.prisma.exerciseRecord.count({ where: { studentId, isCorrect: true } }),
    ]);

    // 学习活跃度（近7天答题数）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await this.prisma.exerciseRecord.count({
      where: {
        studentId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // 章节维度统计
    const records = await this.prisma.exerciseRecord.findMany({
      where: { studentId },
      include: { question: true },
    });

    const chapterMap: Record<string, { total: number; correct: number }> = {};
    for (const rec of records) {
      const chapter = rec.question.chapter;
      if (!chapterMap[chapter]) {
        chapterMap[chapter] = { total: 0, correct: 0 };
      }
      chapterMap[chapter].total += 1;
      if (rec.isCorrect) chapterMap[chapter].correct += 1;
    }

    const chapterStats = Object.keys(chapterMap).map((chapter) => {
      const { total, correct } = chapterMap[chapter];
      return {
        chapter,
        total,
        correct,
        accuracy: total ? Math.round((correct / total) * 100) : 0,
      };
    });

    const accuracy = totalAnswered ? Math.round((correctAnswered / totalAnswered) * 100) : 0;

    return {
      totalAnswered,
      correctAnswered,
      accuracy,
      recentActivity,
      chapterStats,
    };
  }

  /**
   * 获取错题集
   */
  async getWrongQuestions(studentId: string, limit = 20) {
    const wrongs = await this.prisma.wrongQuestion.findMany({
      where: { studentId, isResolved: false },
      include: {
        question: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return wrongs.map((w) => w.question);
  }

  /**
   * 标记错题已解决
   */
  async markWrongQuestionResolved(studentId: string, questionId: string) {
    await this.prisma.wrongQuestion.update({
      where: {
        studentId_questionId: {
          studentId,
          questionId,
        },
      },
      data: { isResolved: true },
    });
  }
}

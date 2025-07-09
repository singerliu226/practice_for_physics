import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { QuestionBankService } from '../questionbank/questionbank.service';

export interface SubmitAnswerDto {
  questionId: string;
  answer: string;
  timeSpent?: number;
}

export interface StartExerciseDto {
  chapter?: string;
  difficulty?: number;
  questionCount: number;
  mode: 'random' | 'chapter' | 'difficulty' | 'wrong';
}

/**
 * 练习服务
 * 处理学生答题、进度统计和错题管理
 */
@Injectable()
export class ExerciseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly questionBankService: QuestionBankService,
  ) {}

  /**
   * 开始练习 - 获取题目集合
   */
  async startExercise(studentId: string, dto: StartExerciseDto) {
    try {
      let questions = [];

      switch (dto.mode) {
        case 'random':
          questions = await this.questionBankService.getRandomQuestions(
            dto.questionCount,
          );
          break;
        case 'chapter':
          if (!dto.chapter) {
            throw new BadRequestException('章节练习需要指定章节');
          }
          questions = await this.questionBankService.getRandomQuestions(
            dto.questionCount,
            dto.chapter,
          );
          break;
        case 'difficulty':
          if (!dto.difficulty) {
            throw new BadRequestException('难度练习需要指定难度');
          }
          questions = await this.questionBankService.getRandomQuestions(
            dto.questionCount,
            dto.chapter,
            dto.difficulty,
          );
          break;
        case 'wrong':
          questions = await this.getWrongQuestions(studentId, dto.questionCount);
          break;
        default:
          throw new BadRequestException('无效的练习模式');
      }

      if (questions.length === 0) {
        throw new BadRequestException('没有找到符合条件的题目');
      }

      // 隐藏答案，只返回题目内容
      const exerciseQuestions = questions.map(q => ({
        id: q.id,
        title: q.title,
        content: q.content,
        options: q.options,
        chapter: q.chapter,
        section: q.section,
        difficulty: q.difficulty,
        tags: q.tags,
      }));

      this.logger.log(
        `Student ${studentId} started exercise with ${questions.length} questions`,
        'ExerciseService',
      );

      return {
        sessionId: `session_${Date.now()}_${studentId}`,
        questions: exerciseQuestions,
        totalCount: questions.length,
        mode: dto.mode,
        startTime: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to start exercise for student ${studentId}: ${error.message}`,
        error.stack,
        'ExerciseService',
      );
      throw error;
    }
  }

  /**
   * 提交答案
   */
  async submitAnswer(studentId: string, dto: SubmitAnswerDto) {
    try {
      // 获取题目详情
      const question = await this.questionBankService.getQuestionById(dto.questionId);
      
      // 判断答案是否正确
      const isCorrect = this.checkAnswer(dto.answer, question.answer);

      // 记录答题记录
      const exerciseRecord = await this.prisma.exerciseRecord.create({
        data: {
          studentId,
          questionId: dto.questionId,
          answer: dto.answer,
          isCorrect,
          timeSpent: dto.timeSpent,
        },
      });

      // 更新学生统计信息
      await this.updateStudentStats(studentId, isCorrect);

      // 如果答错了，添加到错题本
      if (!isCorrect) {
        await this.addToWrongQuestions(studentId, dto.questionId, dto.answer);
      } else {
        // 如果答对了，检查是否需要从错题本移除
        await this.removeFromWrongQuestions(studentId, dto.questionId);
      }

      // 更新题目统计
      await this.updateQuestionStats(dto.questionId, isCorrect);

      this.logger.log(
        `Student ${studentId} submitted answer for question ${dto.questionId}: ${isCorrect ? 'correct' : 'wrong'}`,
        'ExerciseService',
      );

      return {
        id: exerciseRecord.id,
        isCorrect,
        correctAnswer: question.answer,
        explanation: question.explanation,
      };
    } catch (error) {
      this.logger.error(
        `Failed to submit answer: ${error.message}`,
        error.stack,
        'ExerciseService',
      );
      throw error;
    }
  }

  /**
   * 获取学生答题统计
   */
  async getStudentStats(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: {
        totalAnswered: true,
        correctAnswered: true,
        currentChapter: true,
      },
    });

    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    const accuracy = student.totalAnswered > 0 
      ? Math.round((student.correctAnswered / student.totalAnswered) * 100)
      : 0;

    // 获取最近7天的答题记录
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRecords = await this.prisma.exerciseRecord.findMany({
      where: {
        studentId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // 按章节统计正确率
    const chapterStats = await this.getChapterStats(studentId);

    return {
      totalAnswered: student.totalAnswered,
      correctAnswered: student.correctAnswered,
      accuracy,
      currentChapter: student.currentChapter,
      recentActivity: recentRecords.length,
      chapterStats,
    };
  }

  /**
   * 获取错题本
   */
  async getWrongQuestions(studentId: string, limit = 20) {
    const wrongQuestions = await this.prisma.wrongQuestion.findMany({
      where: {
        studentId,
        isResolved: false,
      },
      include: {
        question: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return wrongQuestions.map(wq => wq.question);
  }

  /**
   * 获取错题本统计
   */
  async getWrongQuestionStats(studentId: string) {
    const [total, byChapter] = await Promise.all([
      this.prisma.wrongQuestion.count({
        where: {
          studentId,
          isResolved: false,
        },
      }),
      this.prisma.wrongQuestion.groupBy({
        by: ['question'],
        where: {
          studentId,
          isResolved: false,
        },
        _count: true,
      }),
    ]);

    return {
      totalWrong: total,
      byChapter,
    };
  }

  /**
   * 标记错题为已掌握
   */
  async markWrongQuestionResolved(studentId: string, questionId: string) {
    await this.prisma.wrongQuestion.updateMany({
      where: {
        studentId,
        questionId,
      },
      data: {
        isResolved: true,
        reviewCount: {
          increment: 1,
        },
      },
    });

    this.logger.log(
      `Wrong question ${questionId} marked as resolved for student ${studentId}`,
      'ExerciseService',
    );
  }

  // 私有方法

  /**
   * 检查答案是否正确
   */
  private checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    // 标准化答案（去除空格、转为大写）
    const normalizeAnswer = (answer: string) => 
      answer.trim().toUpperCase().replace(/\s+/g, '');

    return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
  }

  /**
   * 更新学生统计信息
   */
  private async updateStudentStats(studentId: string, isCorrect: boolean) {
    await this.prisma.student.update({
      where: { id: studentId },
      data: {
        totalAnswered: {
          increment: 1,
        },
        correctAnswered: {
          increment: isCorrect ? 1 : 0,
        },
      },
    });
  }

  /**
   * 添加到错题本
   */
  private async addToWrongQuestions(studentId: string, questionId: string, wrongAnswer: string) {
    // 检查是否已存在
    const existing = await this.prisma.wrongQuestion.findUnique({
      where: {
        studentId_questionId: {
          studentId,
          questionId,
        },
      },
    });

    if (existing) {
      // 更新错误答案和复习次数
      await this.prisma.wrongQuestion.update({
        where: {
          id: existing.id,
        },
        data: {
          wrongAnswer,
          reviewCount: {
            increment: 1,
          },
          isResolved: false, // 重新标记为未解决
        },
      });
    } else {
      // 创建新的错题记录
      await this.prisma.wrongQuestion.create({
        data: {
          studentId,
          questionId,
          wrongAnswer,
        },
      });
    }
  }

  /**
   * 从错题本移除（答对后）
   */
  private async removeFromWrongQuestions(studentId: string, questionId: string) {
    const wrongQuestion = await this.prisma.wrongQuestion.findUnique({
      where: {
        studentId_questionId: {
          studentId,
          questionId,
        },
      },
    });

    if (wrongQuestion && !wrongQuestion.isResolved) {
      await this.prisma.wrongQuestion.update({
        where: {
          id: wrongQuestion.id,
        },
        data: {
          isResolved: true,
          reviewCount: {
            increment: 1,
          },
        },
      });
    }
  }

  /**
   * 更新题目统计
   */
  private async updateQuestionStats(questionId: string, isCorrect: boolean) {
    await this.prisma.question.update({
      where: { id: questionId },
      data: {
        totalAttempts: {
          increment: 1,
        },
        correctAttempts: {
          increment: isCorrect ? 1 : 0,
        },
      },
    });
  }

  /**
   * 获取按章节的统计
   */
  private async getChapterStats(studentId: string) {
    const records = await this.prisma.exerciseRecord.findMany({
      where: { studentId },
      include: {
        question: {
          select: {
            chapter: true,
          },
        },
      },
    });

    const stats = records.reduce((acc, record) => {
      const chapter = record.question.chapter;
      if (!acc[chapter]) {
        acc[chapter] = { total: 0, correct: 0 };
      }
      acc[chapter].total += 1;
      if (record.isCorrect) {
        acc[chapter].correct += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; correct: number }>);

    return Object.entries(stats).map(([chapter, data]) => ({
      chapter,
      total: data.total,
      correct: data.correct,
      accuracy: Math.round((data.correct / data.total) * 100),
    }));
  }
} 
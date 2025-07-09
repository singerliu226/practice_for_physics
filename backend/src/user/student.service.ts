import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';

/**
 * 学生服务
 * 处理学生相关的业务逻辑
 */
@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 创建学生档案
   */
  async createStudent(userId: string, data: {
    name: string;
    grade: string;
    classId?: string;
  }) {
    return this.prisma.student.create({
      data: {
        userId,
        ...data,
      },
    });
  }
} 
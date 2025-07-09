import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';

/**
 * 教师服务
 * 处理教师相关的业务逻辑
 */
@Injectable()
export class TeacherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 创建教师档案
   */
  async createTeacher(userId: string, data: {
    name: string;
    subject?: string;
  }) {
    return this.prisma.teacher.create({
      data: {
        userId,
        subject: data.subject || '物理',
        ...data,
      },
    });
  }
} 
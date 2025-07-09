import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';

/**
 * 用户服务
 * 处理用户基本信息的 CRUD 操作
 */
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 根据ID获取用户信息
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            avatar: true,
            totalAnswered: true,
            correctAnswered: true,
            currentChapter: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            subject: true,
            avatar: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 根据邮箱获取用户信息
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        student: true,
        teacher: true,
      },
    });
  }

  /**
   * 更新用户基本信息
   */
  async updateUser(id: string, data: { email?: string; phone?: string }) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User updated: ${id}`, 'UserService');
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user: ${id}`, error, 'UserService');
      throw error;
    }
  }

  /**
   * 删除用户（软删除或硬删除）
   */
  async deleteUser(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      this.logger.log(`User deleted: ${id}`, 'UserService');
      return { message: '用户删除成功' };
    } catch (error) {
      this.logger.error(`Failed to delete user: ${id}`, error, 'UserService');
      throw error;
    }
  }
} 
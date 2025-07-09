import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../logger/logger.service';

/**
 * Prisma 数据库服务
 * 管理数据库连接生命周期，提供类型安全的数据库操作
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  /**
   * 模块初始化时连接数据库
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully', 'PrismaService');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database', error, 'PrismaService');
      throw error;
    }
  }

  /**
   * 模块销毁时断开数据库连接
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Database disconnected', 'PrismaService');
  }
} 
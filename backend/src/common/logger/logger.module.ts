import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * 日志模块
 * 全局注册，提供基于 Winston 的结构化日志服务
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {} 
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

/**
 * 基于 Winston 的日志服务
 * 实现 NestJS LoggerService 接口，支持文件轮转和结构化日志
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'physics-practice-backend' },
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        
        // 应用日志文件（按日轮转）
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        
        // 错误日志文件
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });
  }

  /**
   * 记录普通信息日志
   */
  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  /**
   * 记录错误日志
   */
  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  /**
   * 记录警告日志
   */
  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  /**
   * 记录调试日志
   */
  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  /**
   * 记录详细日志
   */
  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
} 
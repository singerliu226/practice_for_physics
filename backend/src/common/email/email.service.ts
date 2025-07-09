import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';

/**
 * 邮件发送服务，封装 nodemailer
 * 从环境变量读取 SMTP 配置：
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
 */
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private readonly config: ConfigService, private readonly logger: LoggerService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT') ?? 587,
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
    this.from = this.config.get<string>('FROM_EMAIL') ?? 'no-reply@example.com';
  }

  async send(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
      });
      this.logger.debug(`邮件已发送 → ${to}: ${subject}`, 'EmailService');
    } catch (error) {
      this.logger.error('发送邮件失败', error.message, 'EmailService');
      throw error;
    }
  }
} 
import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * 全局邮件模块，提供 EmailService
 */
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {} 
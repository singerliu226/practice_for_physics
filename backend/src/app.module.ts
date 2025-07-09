import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QuestionBankModule } from './questionbank/questionbank.module';
import { ExerciseModule } from './exercise/exercise.module';

/**
 * 应用根模块
 * 集成配置、数据库、日志、认证和用户管理等核心模块
 */
@Module({
  imports: [
    // 环境变量配置模块
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: ['.env.local', '.env'], // 环境文件优先级
    }),
    
    // 核心基础模块
    PrismaModule,
    LoggerModule,
    
    // 业务功能模块
    AuthModule,
    UserModule,
    QuestionBankModule,
    ExerciseModule,
  ],
})
export class AppModule {} 
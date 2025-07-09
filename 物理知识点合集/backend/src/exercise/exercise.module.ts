import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { QuestionBankModule } from '../questionbank/questionbank.module';

/**
 * 练习模块
 * 提供答题练习、进度统计和错题管理功能
 */
@Module({
  imports: [QuestionBankModule],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {} 
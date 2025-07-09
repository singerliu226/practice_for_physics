import { Module } from '@nestjs/common';
import { AIPlannerService } from './ai-planner.service';
import { AIPlannerController } from './ai-planner.controller';
import { ExerciseModule } from '../exercise/exercise.module';

/**
 * AI学习规划模块
 * 集成Deepseek API，提供智能学习建议和个性化规划
 */
@Module({
  imports: [ExerciseModule],
  controllers: [AIPlannerController],
  providers: [AIPlannerService],
  exports: [AIPlannerService],
})
export class AIPlannerModule {} 
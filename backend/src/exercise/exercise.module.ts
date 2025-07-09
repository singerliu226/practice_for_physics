import { Module, forwardRef } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { QuestionBankModule } from '../questionbank/questionbank.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [QuestionBankModule, forwardRef(() => AuthModule)],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}

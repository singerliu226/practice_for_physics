import { Module, forwardRef } from '@nestjs/common';
import { QuestionBankService } from './questionbank.service';
import { QuestionBankController } from './questionbank.controller';
import { DocxParserService } from './docx-parser.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [QuestionBankController],
  providers: [QuestionBankService, DocxParserService],
  exports: [QuestionBankService],
})
export class QuestionBankModule {}

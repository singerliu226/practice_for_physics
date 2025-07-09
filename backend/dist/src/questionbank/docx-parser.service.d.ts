import { LoggerService } from '../common/logger/logger.service';
import { CreateQuestionDto } from './dto/create-question.dto';
export declare class DocxParserService {
    private readonly logger;
    constructor(logger: LoggerService);
    parseQuestionsFromDocx(fileBuffer: Buffer, chapter: string, difficulty: number): Promise<CreateQuestionDto[]>;
}

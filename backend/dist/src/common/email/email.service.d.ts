import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private transporter;
    private from;
    constructor(config: ConfigService, logger: LoggerService);
    send(to: string, subject: string, text: string): Promise<void>;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("../logger/logger.service");
let EmailService = class EmailService {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.transporter = nodemailer.createTransport({
            host: this.config.get('SMTP_HOST'),
            port: this.config.get('SMTP_PORT') ?? 587,
            secure: false,
            auth: {
                user: this.config.get('SMTP_USER'),
                pass: this.config.get('SMTP_PASS'),
            },
        });
        this.from = this.config.get('FROM_EMAIL') ?? 'no-reply@example.com';
    }
    async send(to, subject, text) {
        try {
            await this.transporter.sendMail({
                from: this.from,
                to,
                subject,
                text,
            });
            this.logger.debug(`邮件已发送 → ${to}: ${subject}`, 'EmailService');
        }
        catch (error) {
            this.logger.error('发送邮件失败', error.message, 'EmailService');
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, logger_service_1.LoggerService])
], EmailService);
//# sourceMappingURL=email.service.js.map
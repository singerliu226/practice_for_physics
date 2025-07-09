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
exports.DocxParserService = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../common/logger/logger.service");
const mammoth = require("mammoth");
let DocxParserService = class DocxParserService {
    constructor(logger) {
        this.logger = logger;
    }
    async parseQuestionsFromDocx(fileBuffer, chapter, difficulty) {
        const { value: rawText } = await mammoth.extractRawText({ buffer: fileBuffer });
        const lines = rawText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length);
        const questions = [];
        let current = null;
        const startQuestionRegex = /^\d+[\.．、]\s*/;
        const optionRegex = /^[A-H][\.．、]/;
        for (const line of lines) {
            if (startQuestionRegex.test(line)) {
                if (current)
                    questions.push(current);
                current = {
                    title: line.replace(startQuestionRegex, '').trim(),
                    content: '',
                    options: [],
                    answer: '',
                };
                continue;
            }
            if (!current)
                continue;
            if (optionRegex.test(line)) {
                current.options = current.options || [];
                current.options.push(line);
                continue;
            }
            if (/^\s*(答案|【?答案】?)\s*[:：]?/.test(line)) {
                current.answer = line
                    .replace(/^\s*(答案|【?答案】?)\s*[:：]?/, '')
                    .trim();
                continue;
            }
            if (line.startsWith('解析')) {
                current.explanation = line.replace(/解析[:：]/, '').trim();
                continue;
            }
            current.content += (current.content ? '\n' : '') + line;
        }
        if (current)
            questions.push(current);
        const result = questions.map((q) => ({
            title: q.title,
            content: q.content,
            options: q.options && q.options.length ? q.options : undefined,
            answer: q.answer,
            explanation: q.explanation,
            chapter,
            section: undefined,
            difficulty,
            tags: [],
        }));
        this.logger.debug(`解析到 ${result.length} 道题目`, 'DocxParserService');
        return result;
    }
};
exports.DocxParserService = DocxParserService;
exports.DocxParserService = DocxParserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], DocxParserService);
//# sourceMappingURL=docx-parser.service.js.map
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
exports.QuestionBankService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_service_1 = require("../common/logger/logger.service");
const docx_parser_service_1 = require("./docx-parser.service");
let QuestionBankService = class QuestionBankService {
    constructor(prisma, logger, docxParser) {
        this.prisma = prisma;
        this.logger = logger;
        this.docxParser = docxParser;
    }
    async createQuestion(data) {
        const question = await this.prisma.question.create({
            data: {
                title: data.title,
                content: data.content,
                options: data.options || null,
                answer: data.answer,
                explanation: data.explanation,
                chapter: data.chapter,
                section: data.section,
                difficulty: data.difficulty,
                tags: data.tags,
            },
        });
        this.logger.log(`Question created: ${question.id}`, 'QuestionBankService');
        return question;
    }
    async getRandomQuestions(count, chapter, difficulty) {
        const whereCondition = {};
        if (chapter)
            whereCondition.chapter = chapter;
        if (difficulty)
            whereCondition.difficulty = difficulty;
        const total = await this.prisma.question.count({ where: whereCondition });
        if (total === 0)
            return [];
        const randomSkip = Math.floor(Math.random() * Math.max(0, total - count));
        return this.prisma.question.findMany({
            where: whereCondition,
            skip: randomSkip,
            take: count,
        });
    }
    async getQuestionById(id) {
        return this.prisma.question.findUnique({ where: { id } });
    }
    async listChapters() {
        const grouped = await this.prisma.question.groupBy({
            by: ['chapter'],
            _count: { chapter: true },
            orderBy: { chapter: 'asc' },
        });
        return grouped.map((g) => ({ name: g.chapter, questionCount: g._count.chapter }));
    }
    async listQuestions(query) {
        const { page = 1, pageSize = 10, chapter, difficulty, tags, keyword, } = query;
        const where = {};
        if (chapter)
            where.chapter = chapter;
        if (typeof difficulty !== 'undefined')
            where.difficulty = difficulty;
        if (tags && tags.length)
            where.tags = { hasSome: tags };
        if (keyword) {
            where.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { content: { contains: keyword, mode: 'insensitive' } },
            ];
        }
        const [total, data] = await this.prisma.$transaction([
            this.prisma.question.count({ where }),
            this.prisma.question.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return { total, data };
    }
    async updateQuestion(id, data) {
        const updated = await this.prisma.question.update({
            where: { id },
            data,
        });
        this.logger.log(`Question updated: ${id}`, 'QuestionBankService');
        return updated;
    }
    async deleteQuestion(id) {
        await this.prisma.question.delete({ where: { id } });
        this.logger.warn(`Question deleted: ${id}`, 'QuestionBankService');
        return { id };
    }
    async importFromDocx(fileBuffer, chapter, difficulty) {
        const questions = await this.docxParser.parseQuestionsFromDocx(fileBuffer, chapter, difficulty);
        if (!questions.length) {
            this.logger.warn('DOCX 中未解析到题目', 'QuestionBankService');
            return { imported: 0 };
        }
        await this.prisma.question.createMany({ data: questions });
        this.logger.log(`Imported ${questions.length} questions`, 'QuestionBankService');
        return { imported: questions.length };
    }
};
exports.QuestionBankService = QuestionBankService;
exports.QuestionBankService = QuestionBankService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logger_service_1.LoggerService,
        docx_parser_service_1.DocxParserService])
], QuestionBankService);
//# sourceMappingURL=questionbank.service.js.map
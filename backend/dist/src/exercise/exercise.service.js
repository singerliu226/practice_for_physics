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
exports.ExerciseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const logger_service_1 = require("../common/logger/logger.service");
const questionbank_service_1 = require("../questionbank/questionbank.service");
const crypto_1 = require("crypto");
let ExerciseService = class ExerciseService {
    constructor(prisma, questionBank, logger) {
        this.prisma = prisma;
        this.questionBank = questionBank;
        this.logger = logger;
    }
    async startExercise(studentId, dto) {
        const { mode, chapter, difficulty, count = 10 } = dto;
        let questions = [];
        switch (mode) {
            case 'chapter': {
                questions = await this.questionBank.getRandomQuestions(count, chapter, undefined);
                break;
            }
            case 'difficulty': {
                questions = await this.questionBank.getRandomQuestions(count, undefined, difficulty);
                break;
            }
            case 'wrong': {
                questions = await this.getWrongQuestions(studentId, count);
                break;
            }
            case 'random':
            default: {
                questions = await this.questionBank.getRandomQuestions(count);
                break;
            }
        }
        this.logger.log(`Student ${studentId} started exercise, mode=${mode}, count=${questions.length}`, 'ExerciseService');
        return {
            sessionId: (0, crypto_1.randomUUID)(),
            questions,
            totalCount: questions.length,
            mode,
            startTime: new Date(),
        };
    }
    async submitAnswer(studentId, dto) {
        try {
            const question = await this.prisma.question.findUnique({ where: { id: dto.questionId } });
            if (!question) {
                throw new Error('题目不存在');
            }
            const isCorrect = dto.answer.trim() === question.answer.trim();
            await this.prisma.exerciseRecord.create({
                data: {
                    studentId,
                    questionId: question.id,
                    answer: dto.answer,
                    isCorrect,
                    timeSpent: dto.timeSpent || null,
                },
            });
            await this.prisma.question.update({
                where: { id: question.id },
                data: {
                    totalAttempts: { increment: 1 },
                    correctAttempts: { increment: isCorrect ? 1 : 0 },
                },
            });
            await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    totalAnswered: { increment: 1 },
                    correctAnswered: { increment: isCorrect ? 1 : 0 },
                },
            });
            if (!isCorrect) {
                await this.prisma.wrongQuestion.upsert({
                    where: {
                        studentId_questionId: {
                            studentId,
                            questionId: question.id,
                        },
                    },
                    update: {
                        wrongAnswer: dto.answer,
                        reviewCount: { increment: 1 },
                        isResolved: false,
                    },
                    create: {
                        studentId,
                        questionId: question.id,
                        wrongAnswer: dto.answer,
                    },
                });
            }
            this.logger.log(`Student ${studentId} submitted answer for question ${question.id} (${isCorrect ? 'correct' : 'wrong'})`, 'ExerciseService');
            return {
                isCorrect,
                correctAnswer: question.answer,
                explanation: question.explanation,
            };
        }
        catch (error) {
            this.logger.error(`Failed to submit answer: ${error.message}`, error.stack, 'ExerciseService');
            throw error;
        }
    }
    async getStudentStats(studentId) {
        const [totalAnswered, correctAnswered] = await Promise.all([
            this.prisma.exerciseRecord.count({ where: { studentId } }),
            this.prisma.exerciseRecord.count({ where: { studentId, isCorrect: true } }),
        ]);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentActivity = await this.prisma.exerciseRecord.count({
            where: {
                studentId,
                createdAt: { gte: sevenDaysAgo },
            },
        });
        const records = await this.prisma.exerciseRecord.findMany({
            where: { studentId },
            include: { question: true },
        });
        const chapterMap = {};
        for (const rec of records) {
            const chapter = rec.question.chapter;
            if (!chapterMap[chapter]) {
                chapterMap[chapter] = { total: 0, correct: 0 };
            }
            chapterMap[chapter].total += 1;
            if (rec.isCorrect)
                chapterMap[chapter].correct += 1;
        }
        const chapterStats = Object.keys(chapterMap).map((chapter) => {
            const { total, correct } = chapterMap[chapter];
            return {
                chapter,
                total,
                correct,
                accuracy: total ? Math.round((correct / total) * 100) : 0,
            };
        });
        const accuracy = totalAnswered ? Math.round((correctAnswered / totalAnswered) * 100) : 0;
        return {
            totalAnswered,
            correctAnswered,
            accuracy,
            recentActivity,
            chapterStats,
        };
    }
    async getWrongQuestions(studentId, limit = 20) {
        const wrongs = await this.prisma.wrongQuestion.findMany({
            where: { studentId, isResolved: false },
            include: {
                question: true,
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        return wrongs.map((w) => w.question);
    }
    async markWrongQuestionResolved(studentId, questionId) {
        await this.prisma.wrongQuestion.update({
            where: {
                studentId_questionId: {
                    studentId,
                    questionId,
                },
            },
            data: { isResolved: true },
        });
    }
};
exports.ExerciseService = ExerciseService;
exports.ExerciseService = ExerciseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        questionbank_service_1.QuestionBankService,
        logger_service_1.LoggerService])
], ExerciseService);
//# sourceMappingURL=exercise.service.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBankController = void 0;
const common_1 = require("@nestjs/common");
const questionbank_service_1 = require("./questionbank.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_question_dto_1 = require("./dto/create-question.dto");
const query_question_dto_1 = require("./dto/query-question.dto");
const update_question_dto_1 = require("./dto/update-question.dto");
const platform_express_1 = require("@nestjs/platform-express");
const role_guard_1 = require("../auth/guards/role.guard");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let QuestionBankController = class QuestionBankController {
    constructor(questionBankService) {
        this.questionBankService = questionBankService;
    }
    async createQuestion(createQuestionDto) {
        return this.questionBankService.createQuestion(createQuestionDto);
    }
    async getRandomQuestions(count = 10) {
        return this.questionBankService.getRandomQuestions(Number(count));
    }
    async listQuestions(query) {
        return this.questionBankService.listQuestions(query);
    }
    async listChapters() {
        return this.questionBankService.listChapters();
    }
    async getQuestionById(id) {
        return this.questionBankService.getQuestionById(id);
    }
    async updateQuestion(id, data) {
        return this.questionBankService.updateQuestion(id, data);
    }
    async deleteQuestion(id) {
        return this.questionBankService.deleteQuestion(id);
    }
    async importQuestions(file, chapter, difficulty) {
        return this.questionBankService.importFromDocx(file.buffer, chapter, Number(difficulty || 1));
    }
};
exports.QuestionBankController = QuestionBankController;
__decorate([
    (0, common_1.Post)(),
    (0, role_guard_1.Roles)([client_1.UserRole.TEACHER, client_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_question_dto_1.CreateQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Get)('random'),
    __param(0, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "getRandomQuestions", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_question_dto_1.QueryQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "listQuestions", null);
__decorate([
    (0, common_1.Get)('chapters'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "listChapters", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "getQuestionById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, role_guard_1.Roles)([client_1.UserRole.TEACHER, client_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_question_dto_1.UpdateQuestionDto]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, role_guard_1.Roles)([client_1.UserRole.TEACHER, client_1.UserRole.ADMIN]),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "deleteQuestion", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, role_guard_1.Roles)([client_1.UserRole.TEACHER, client_1.UserRole.ADMIN]),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('chapter')),
    __param(2, (0, common_1.Body)('difficulty')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "importQuestions", null);
exports.QuestionBankController = QuestionBankController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard),
    (0, common_1.Controller)('questions'),
    __metadata("design:paramtypes", [questionbank_service_1.QuestionBankService])
], QuestionBankController);
//# sourceMappingURL=questionbank.controller.js.map
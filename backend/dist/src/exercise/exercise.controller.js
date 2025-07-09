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
exports.ExerciseController = void 0;
const common_1 = require("@nestjs/common");
const exercise_service_1 = require("./exercise.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const start_exercise_dto_1 = require("./dto/start-exercise.dto");
const submit_answer_dto_1 = require("./dto/submit-answer.dto");
let ExerciseController = class ExerciseController {
    constructor(exerciseService) {
        this.exerciseService = exerciseService;
    }
    async getStudentStats(req) {
        const studentId = req.user.studentId || req.user.sub;
        return this.exerciseService.getStudentStats(studentId);
    }
    async startExercise(req, startDto) {
        const studentId = req.user.studentId || req.user.sub;
        return this.exerciseService.startExercise(studentId, startDto);
    }
    async submitAnswer(req, submitDto) {
        const studentId = req.user.studentId || req.user.sub;
        return this.exerciseService.submitAnswer(studentId, submitDto);
    }
    async getWrongQuestions(req, limit = 20) {
        const studentId = req.user.studentId || req.user.sub;
        return this.exerciseService.getWrongQuestions(studentId, limit);
    }
    async markWrongQuestionResolved(req, questionId) {
        const studentId = req.user.studentId || req.user.sub;
        await this.exerciseService.markWrongQuestionResolved(studentId, questionId);
        return { success: true };
    }
};
exports.ExerciseController = ExerciseController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getStudentStats", null);
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_exercise_dto_1.StartExerciseDto]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "startExercise", null);
__decorate([
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_answer_dto_1.SubmitAnswerDto]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "submitAnswer", null);
__decorate([
    (0, common_1.Get)('wrong-questions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getWrongQuestions", null);
__decorate([
    (0, common_1.Post)('wrong-questions/:questionId/resolved'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('questionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "markWrongQuestionResolved", null);
exports.ExerciseController = ExerciseController = __decorate([
    (0, common_1.Controller)('exercise'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [exercise_service_1.ExerciseService])
], ExerciseController);
//# sourceMappingURL=exercise.controller.js.map
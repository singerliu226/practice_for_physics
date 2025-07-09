"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseModule = void 0;
const common_1 = require("@nestjs/common");
const exercise_service_1 = require("./exercise.service");
const exercise_controller_1 = require("./exercise.controller");
const questionbank_module_1 = require("../questionbank/questionbank.module");
const auth_module_1 = require("../auth/auth.module");
let ExerciseModule = class ExerciseModule {
};
exports.ExerciseModule = ExerciseModule;
exports.ExerciseModule = ExerciseModule = __decorate([
    (0, common_1.Module)({
        imports: [questionbank_module_1.QuestionBankModule, (0, common_1.forwardRef)(() => auth_module_1.AuthModule)],
        controllers: [exercise_controller_1.ExerciseController],
        providers: [exercise_service_1.ExerciseService],
        exports: [exercise_service_1.ExerciseService],
    })
], ExerciseModule);
//# sourceMappingURL=exercise.module.js.map
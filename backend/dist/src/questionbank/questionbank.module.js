"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBankModule = void 0;
const common_1 = require("@nestjs/common");
const questionbank_service_1 = require("./questionbank.service");
const questionbank_controller_1 = require("./questionbank.controller");
const docx_parser_service_1 = require("./docx-parser.service");
const auth_module_1 = require("../auth/auth.module");
let QuestionBankModule = class QuestionBankModule {
};
exports.QuestionBankModule = QuestionBankModule;
exports.QuestionBankModule = QuestionBankModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule)],
        controllers: [questionbank_controller_1.QuestionBankController],
        providers: [questionbank_service_1.QuestionBankService, docx_parser_service_1.DocxParserService],
        exports: [questionbank_service_1.QuestionBankService],
    })
], QuestionBankModule);
//# sourceMappingURL=questionbank.module.js.map
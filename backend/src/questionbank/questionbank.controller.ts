import { Controller, Get, Post, Body, Query, Param, Put, Delete, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { QuestionBankService } from './questionbank.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuestionDto as NewCreateQuestionDto } from './dto/create-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles, RoleGuard } from '../auth/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('questions')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  /** 创建题目，仅教师/管理员可用 */
  @Post()
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  async createQuestion(@Body() createQuestionDto: NewCreateQuestionDto) {
    return this.questionBankService.createQuestion(createQuestionDto);
  }

  /** 随机获取题目，对所有已登录用户开放 */
  @Get('random')
  async getRandomQuestions(@Query('count') count = 10) {
    return this.questionBankService.getRandomQuestions(Number(count));
  }

  /** 列表查询题目（分页过滤） */
  @Get()
  async listQuestions(@Query() query: QueryQuestionDto) {
    return this.questionBankService.listQuestions(query);
  }

  /** 获取章节列表（公开接口） */
  @Get('chapters')
  @Public()
  async listChapters() {
    return this.questionBankService.listChapters();
  }

  /** 获取题目详情 */
  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionBankService.getQuestionById(id);
  }

  /** 更新题目，仅教师/管理员 */
  @Put(':id')
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  async updateQuestion(
    @Param('id') id: string,
    @Body() data: UpdateQuestionDto,
  ) {
    return this.questionBankService.updateQuestion(id, data);
  }

  /** 删除题目，仅教师/管理员 */
  @Delete(':id')
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  async deleteQuestion(@Param('id') id: string) {
    return this.questionBankService.deleteQuestion(id);
  }

  /** 导入 Docx 文件创建题库，仅教师/管理员 */
  @Post('import')
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  async importQuestions(
    @UploadedFile() file: Express.Multer.File,
    @Body('chapter') chapter: string,
    @Body('difficulty') difficulty: number,
  ) {
    return this.questionBankService.importFromDocx(
      file.buffer,
      chapter,
      Number(difficulty || 1),
    );
  }
}

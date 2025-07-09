import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionBankService, CreateQuestionDto } from './questionbank.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/guards/role.guard';
import { UserRole } from '@prisma/client';

/**
 * 题库控制器
 * 提供题目管理和文档导入的 REST API
 */
@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  /**
   * 创建题目
   */
  @Post()
  @UseGuards(RoleGuard)
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionBankService.createQuestion(createQuestionDto);
  }

  /**
   * 获取所有章节
   */
  @Get('chapters')
  async getChapters() {
    return this.questionBankService.getChapters();
  }

  /**
   * 根据章节获取题目
   */
  @Get('chapter/:chapter')
  async getQuestionsByChapter(
    @Param('chapter') chapter: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.questionBankService.getQuestionsByChapter(chapter, page, limit);
  }

  /**
   * 根据难度获取题目
   */
  @Get('difficulty/:difficulty')
  async getQuestionsByDifficulty(
    @Param('difficulty', ParseIntPipe) difficulty: number,
    @Query('chapter') chapter?: string,
  ) {
    return this.questionBankService.getQuestionsByDifficulty(difficulty, chapter);
  }

  /**
   * 随机获取题目（用于练习）
   */
  @Get('random')
  async getRandomQuestions(
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
    @Query('chapter') chapter?: string,
    @Query('difficulty', ParseIntPipe) difficulty?: number,
  ) {
    return this.questionBankService.getRandomQuestions(count, chapter, difficulty);
  }

  /**
   * 从 DOCX 文件导入题目
   */
  @Post('import')
  @UseGuards(RoleGuard)
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  async importFromDocx(
    @UploadedFile() file: Express.Multer.File,
    @Body('chapter') chapter: string,
    @Body('difficulty', ParseIntPipe) difficulty: number,
  ) {
    if (!file) {
      throw new Error('请选择要导入的 DOCX 文件');
    }

    return this.questionBankService.importFromDocx(file.buffer, chapter, difficulty);
  }

  /**
   * 获取题目详情
   */
  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionBankService.getQuestionById(id);
  }

  /**
   * 更新题目
   */
  @Put(':id')
  @UseGuards(RoleGuard)
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  async updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: Partial<CreateQuestionDto>,
  ) {
    return this.questionBankService.updateQuestion(id, updateQuestionDto);
  }

  /**
   * 删除题目
   */
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  async deleteQuestion(@Param('id') id: string) {
    return this.questionBankService.deleteQuestion(id);
  }
} 
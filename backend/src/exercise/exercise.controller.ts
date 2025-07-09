import { Controller, Get, Post, Body, UseGuards, Request, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartExerciseDto } from './dto/start-exercise.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('exercise')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  /** 获取学习统计 */
  @Get('stats')
  async getStudentStats(@Request() req) {
    const studentId = req.user.studentId || req.user.sub;
    return this.exerciseService.getStudentStats(studentId);
  }

  /** 开始练习 */
  @Post('start')
  async startExercise(@Request() req, @Body() startDto: StartExerciseDto) {
    const studentId = req.user.studentId || req.user.sub;
    return this.exerciseService.startExercise(studentId, startDto);
  }

  /** 提交答案 */
  @Post('submit')
  async submitAnswer(@Request() req, @Body() submitDto: SubmitAnswerDto) {
    const studentId = req.user.studentId || req.user.sub;
    return this.exerciseService.submitAnswer(studentId, submitDto);
  }

  /** 获取错题本 */
  @Get('wrong-questions')
  async getWrongQuestions(
    @Request() req,
    @Query('limit', ParseIntPipe) limit = 20,
  ) {
    const studentId = req.user.studentId || req.user.sub;
    return this.exerciseService.getWrongQuestions(studentId, limit);
  }

  /** 标记错题已解决 */
  @Post('wrong-questions/:questionId/resolved')
  async markWrongQuestionResolved(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const studentId = req.user.studentId || req.user.sub;
    await this.exerciseService.markWrongQuestionResolved(studentId, questionId);
    return { success: true };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ExerciseService, StartExerciseDto, SubmitAnswerDto } from './exercise.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/guards/role.guard';
import { UserRole } from '@prisma/client';

/**
 * 练习控制器
 * 提供学生答题练习和统计相关的 REST API
 */
@Controller('exercise')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  /**
   * 开始练习
   */
  @Post('start')
  @UseGuards(RoleGuard)
  @Roles([UserRole.STUDENT])
  async startExercise(@Request() req, @Body() startExerciseDto: StartExerciseDto) {
    const studentId = req.user.studentId;
    return this.exerciseService.startExercise(studentId, startExerciseDto);
  }

  /**
   * 提交答案
   */
  @Post('submit')
  @UseGuards(RoleGuard)
  @Roles([UserRole.STUDENT])
  async submitAnswer(@Request() req, @Body() submitAnswerDto: SubmitAnswerDto) {
    const studentId = req.user.studentId;
    return this.exerciseService.submitAnswer(studentId, submitAnswerDto);
  }

  /**
   * 获取学生答题统计
   */
  @Get('stats')
  @UseGuards(RoleGuard)
  @Roles([UserRole.STUDENT])
  async getStudentStats(@Request() req) {
    const studentId = req.user.studentId;
    return this.exerciseService.getStudentStats(studentId);
  }

  /**
   * 获取错题本
   */
  @Get('wrong-questions')
  @UseGuards(RoleGuard)
  @Roles([UserRole.STUDENT])
  async getWrongQuestions(
    @Request() req,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const studentId = req.user.studentId;
    return this.exerciseService.getWrongQuestions(studentId, limit);
  }

  /**
   * 获取错题本统计
   */
  @Get('wrong-stats')
  @UseGuards(RoleGuard)
  @Roles([UserRole.STUDENT])
  async getWrongQuestionStats(@Request() req) {
    const studentId = req.user.studentId;
    return this.exerciseService.getWrongQuestionStats(studentId);
  }

  /**
   * 标记错题为已掌握
   */
  @Post('wrong-questions/:questionId/resolved')
  @UseGuards(RoleGuard)
  @Roles([UserRole.STUDENT])
  async markWrongQuestionResolved(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const studentId = req.user.studentId;
    await this.exerciseService.markWrongQuestionResolved(studentId, questionId);
    return { message: '错题已标记为已掌握' };
  }

  /**
   * 教师查看学生练习情况
   */
  @Get('teacher/student/:studentId/stats')
  @UseGuards(RoleGuard)
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  async getStudentStatsForTeacher(@Param('studentId') studentId: string) {
    return this.exerciseService.getStudentStats(studentId);
  }
} 
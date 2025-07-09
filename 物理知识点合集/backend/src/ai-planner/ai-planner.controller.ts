import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AIPlannerService } from './ai-planner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/guards/role.guard';
import { UserRole } from '@prisma/client';

/**
 * AI学习规划控制器
 * 提供智能学习建议和个性化规划的 REST API
 */
@Controller('ai-planner')
@UseGuards(JwtAuthGuard)
export class AIPlannerController {
  constructor(private readonly aiPlannerService: AIPlannerService) {}

  /**
   * 获取个性化学习计划
   */
  @Get('learning-plan')
  @UseGuards(RoleGuard)
  @Roles([UserRole.STUDENT])
  async getLearningPlan(@Request() req) {
    const studentId = req.user.studentId;
    return this.aiPlannerService.generateLearningPlan(studentId);
  }

  /**
   * 获取学习提醒
   */
  @Get('reminders')
  @UseGuards(RoleGuard)
  @Roles([UserRole.STUDENT])
  async getStudyReminders(@Request() req) {
    const studentId = req.user.studentId;
    const reminders = await this.aiPlannerService.getStudyReminder(studentId);
    return { reminders };
  }

  /**
   * 教师为学生生成学习计划
   */
  @Post('teacher/student/:studentId/plan')
  @UseGuards(RoleGuard)
  @Roles([UserRole.TEACHER, UserRole.ADMIN])
  async generatePlanForStudent(@Request() req) {
    const studentId = req.params.studentId;
    return this.aiPlannerService.generateLearningPlan(studentId);
  }
} 
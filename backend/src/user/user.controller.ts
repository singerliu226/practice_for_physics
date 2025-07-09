import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * 用户控制器
 * 提供用户信息查询的 API 端点
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.userService.findById(req.user.id);
  }
} 
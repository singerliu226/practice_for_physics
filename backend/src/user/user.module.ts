import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { StudentService } from './student.service';
import { TeacherService } from './teacher.service';
import { AuthModule } from '../auth/auth.module';

/**
 * 用户管理模块
 * 提供学生、教师信息管理和查询功能
 */
@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, StudentService, TeacherService],
  exports: [UserService, StudentService, TeacherService],
})
export class UserModule {} 
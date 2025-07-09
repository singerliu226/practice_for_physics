import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

/**
 * 角色权限守卫
 * 基于用户角色控制访问权限
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // 如果没有设置角色要求，则允许访问
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    const hasPermission = requiredRoles.includes(user.role);
    
    if (!hasPermission) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }
}

/**
 * 角色装饰器，用于标记需要的用户角色
 */
export const Roles = (roles: UserRole[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('roles', roles, target);
  };
}; 
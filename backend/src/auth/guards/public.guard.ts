import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * 永远返回 true，用于覆盖类级别 Guard，实现公共路由
 */
@Injectable()
export class PublicGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
} 
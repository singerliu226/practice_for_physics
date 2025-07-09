import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class PublicGuard implements CanActivate {
    canActivate(_context: ExecutionContext): boolean;
}

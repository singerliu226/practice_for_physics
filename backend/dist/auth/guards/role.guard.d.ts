import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
export declare class RoleGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
export declare const Roles: (roles: UserRole[]) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;

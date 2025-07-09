import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private readonly jwtService;
    private readonly configService;
    private readonly authService;
    constructor(jwtService: JwtService, configService: ConfigService, authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};

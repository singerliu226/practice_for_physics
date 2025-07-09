import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<{
        teacher: {
            id: string;
            name: string;
            subject: string;
            avatar: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        student: {
            id: string;
            name: string;
            avatar: string;
            grade: string;
            totalAnswered: number;
            correctAnswered: number;
            currentChapter: string;
        };
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}

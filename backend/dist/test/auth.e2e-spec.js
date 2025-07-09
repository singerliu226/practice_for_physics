"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('AuthController (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('/auth/register (POST)', () => {
        it('should register a new user successfully', () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'password123',
                role: 'STUDENT',
            };
            return request(app.getHttpServer())
                .post('/auth/register')
                .send(registerDto)
                .expect(201)
                .expect((res) => {
                expect(res.body).toHaveProperty('user');
                expect(res.body).toHaveProperty('accessToken');
                expect(res.body).toHaveProperty('refreshToken');
                expect(res.body.user.email).toBe(registerDto.email);
            });
        });
        it('should reject duplicate email registration', async () => {
            const registerDto = {
                email: 'duplicate@example.com',
                password: 'password123',
            };
            await request(app.getHttpServer())
                .post('/auth/register')
                .send(registerDto)
                .expect(201);
            return request(app.getHttpServer())
                .post('/auth/register')
                .send(registerDto)
                .expect(409);
        });
    });
    describe('/auth/login (POST)', () => {
        beforeEach(async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: 'login-test@example.com',
                password: 'password123',
            });
        });
        it('should login with valid credentials', () => {
            const loginDto = {
                email: 'login-test@example.com',
                password: 'password123',
            };
            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(200)
                .expect((res) => {
                expect(res.body).toHaveProperty('user');
                expect(res.body).toHaveProperty('accessToken');
                expect(res.body).toHaveProperty('refreshToken');
            });
        });
        it('should reject invalid credentials', () => {
            const loginDto = {
                email: 'login-test@example.com',
                password: 'wrongpassword',
            };
            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401);
        });
    });
    describe('/users/profile (GET)', () => {
        let accessToken;
        beforeEach(async () => {
            const registerResponse = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: 'profile-test@example.com',
                password: 'password123',
            });
            accessToken = registerResponse.body.accessToken;
        });
        it('should get user profile with valid token', () => {
            return request(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                expect(res.body).toHaveProperty('id');
                expect(res.body).toHaveProperty('email');
                expect(res.body.email).toBe('profile-test@example.com');
            });
        });
        it('should reject request without token', () => {
            return request(app.getHttpServer())
                .get('/users/profile')
                .expect(401);
        });
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./common/logger/logger.service");
try {
    require('@iconv-lite/encodings');
}
catch {
    require('iconv-lite/encodings');
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const loggerService = app.get(logger_service_1.LoggerService);
    app.useLogger(loggerService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://your-frontend-domain.com']
            : true,
        credentials: true,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    loggerService.log(`🚀 Application is running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap().catch(err => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
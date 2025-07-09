import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './common/logger/logger.service';

// 修复 body-parser 在解析请求体时动态加载 encodings 报错
// eslint-disable-next-line @typescript-eslint/no-var-requires
try {
  // 新版 body-parser 会尝试加载 @iconv-lite/encodings
  require('@iconv-lite/encodings');
} catch {
  // 旧版 fall back 到 iconv-lite/encodings
  require('iconv-lite/encodings');
}

/**
 * 启动 NestJS 应用
 * 配置全局验证管道和自定义日志服务
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // 缓冲日志直到自定义 logger 接管
  });

  // 使用自定义 Logger
  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动过滤非 DTO 属性
      forbidNonWhitelisted: true, // 禁止未定义的属性
      transform: true, // 自动类型转换
    }),
  );

  // CORS 配置
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
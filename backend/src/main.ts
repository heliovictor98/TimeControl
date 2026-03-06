import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function getCorsOrigin(): string | string[] | boolean {
  const cors = process.env.CORS_ORIGINS;
  if (cors === '*' || cors === 'true') return true;
  if (cors) return cors.split(',').map((o) => o.trim());
  return process.env.FRONTEND_URL ?? 'http://localhost:4200';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: getCorsOrigin() });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

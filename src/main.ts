import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://fe-insidia.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();

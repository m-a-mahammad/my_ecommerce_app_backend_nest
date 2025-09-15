import dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 uploads have been created automatically.');
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();

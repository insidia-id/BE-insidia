import 'reflect-metadata';

import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

let cachedHandler:
  | ((request: Request, response: Response) => void | Promise<void>)
  | null = null;

async function createHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors();
  await app.init();

  cachedHandler = server;
  return cachedHandler;
}

export default async function handler(request: Request, response: Response) {
  const app = await createHandler();
  return app(request, response);
}

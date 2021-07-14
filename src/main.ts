import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ServeModule } from './serve.module';

async function bootstrap() {
  const serveApp = await NestFactory.create(ServeModule);
  await serveApp.listen(3000);
  await NestFactory.createApplicationContext(AppModule);
}
bootstrap();

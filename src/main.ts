import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const port = process.env.PORT || 3001;

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Company Dashboard API')
    .setDescription('API for the final project with roles and authorization')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}
bootstrap();

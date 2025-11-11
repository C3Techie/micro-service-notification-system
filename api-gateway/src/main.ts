import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // CORS
  app.enableCors();
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Notification System API')
    .setDescription('Microservices-based notification system')
    .setVersion('1.0')
    .addTag('notifications')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(8000);
  console.log('API Gateway running on port 8000');
  console.log('Swagger documentation available at http://localhost:8000/api/docs');
}
bootstrap();
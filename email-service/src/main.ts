import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { EmailModule } from './email/email.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('EmailService');
  
  const app = await NestFactory.create(EmailModule);
  const port = process.env.PORT || 3004;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'email.queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 1,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(port);
  
  logger.log(`✅ Email Service is running`);
  logger.log(`📧 Microservice: listening on email.queue`);
  logger.log(`🌐 HTTP Server: http://localhost:${port}`);
  logger.log(`🏥 Health Check: http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('Error starting Email Service:', error);
  process.exit(1);
});
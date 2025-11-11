import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
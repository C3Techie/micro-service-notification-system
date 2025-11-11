import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
      this.channel = await this.connection.createChannel();
      
      // Assert exchanges and queues
      await this.channel.assertExchange('notifications.direct', 'direct', { durable: true });
      await this.channel.assertQueue('email.queue', { durable: true });
      await this.channel.assertQueue('push.queue', { durable: true });
      await this.channel.assertQueue('failed.queue', { durable: true });
      
      // Bind queues to exchange
      await this.channel.bindQueue('email.queue', 'notifications.direct', 'email');
      await this.channel.bindQueue('push.queue', 'notifications.direct', 'push');
      await this.channel.bindQueue('failed.queue', 'notifications.direct', 'failed');
      
      this.logger.log('RabbitMQ connected and queues asserted');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      // Don't throw here, allow retry mechanism
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  private ensureConnected() {
    if (!this.channel || !this.connection) {
      throw new Error('RabbitMQ not connected');
    }
    return this.channel;
  }

  async sendToQueue(queue: string, message: any): Promise<boolean> {
    try {
      const channel = this.ensureConnected();
      const sent = channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      
      if (!sent) {
        throw new Error('Message could not be sent - channel buffer full');
      }
      
      return true;
    } catch (error) {
      this.logger.error('Error sending message to queue:', error);
      throw error;
    }
  }

  async publishToExchange(exchange: string, routingKey: string, message: any): Promise<boolean> {
    try {
      const channel = this.ensureConnected();
      return channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      this.logger.error('Error publishing to exchange:', error);
      throw error;
    }
  }

  // Helper method to check connection health
  async isConnected(): Promise<boolean> {
    return this.connection !== null && this.channel !== null;
  }
}
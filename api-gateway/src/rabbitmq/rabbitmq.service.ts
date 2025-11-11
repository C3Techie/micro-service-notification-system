import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
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
      
      console.log('RabbitMQ connected and queues asserted');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async sendToQueue(queue: string, message: any): Promise<boolean> {
    try {
      const sent = this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      
      if (!sent) {
        throw new Error('Message could not be sent - channel buffer full');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending message to queue:', error);
      throw error;
    }
  }

  async publishToExchange(exchange: string, routingKey: string, message: any): Promise<boolean> {
    try {
      return this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    } catch (error) {
      console.error('Error publishing to exchange:', error);
      throw error;
    }
  }

  // Helper method to check connection health
  async isConnected(): Promise<boolean> {
    return this.connection !== undefined && this.channel !== undefined;
  }
}
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private emailClient: ClientProxy;
  private pushClient: ClientProxy;

  async onModuleInit() {
    try {
      // Create clients for different queues
      this.emailClient = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'email.queue',
          queueOptions: {
            durable: true,
          },
        },
      });

      this.pushClient = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'push.queue',
          queueOptions: {
            durable: true,
          },
        },
      });

      // Connect clients
      await this.emailClient.connect();
      await this.pushClient.connect();
      
      this.logger.log('RabbitMQ clients connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect RabbitMQ clients:', error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.emailClient) {
        await this.emailClient.close();
      }
      if (this.pushClient) {
        await this.pushClient.close();
      }
      this.logger.log('RabbitMQ clients closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ clients:', error);
    }
  }

  async sendToEmailQueue(message: any): Promise<boolean> {
    try {
      if (!this.emailClient) {
        throw new Error('Email client not connected');
      }
      
      const sent = this.emailClient.emit('send_email', message);
      this.logger.log(`Message sent to email queue: ${JSON.stringify(message)}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending message to email queue:', error);
      throw error;
    }
  }

  async sendToPushQueue(message: any): Promise<boolean> {
    try {
      if (!this.pushClient) {
        throw new Error('Push client not connected');
      }
      
      const sent = this.pushClient.emit('send_push', message);
      this.logger.log(`Message sent to push queue: ${JSON.stringify(message)}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending message to push queue:', error);
      throw error;
    }
  }

  async publishToExchange(routingKey: string, message: any): Promise<boolean> {
    try {
      // Route to appropriate queue based on routing key
      if (routingKey === 'email') {
        return this.sendToEmailQueue(message);
      } else if (routingKey === 'push') {
        return this.sendToPushQueue(message);
      } else {
        throw new Error(`Unknown routing key: ${routingKey}`);
      }
    } catch (error) {
      this.logger.error(`Error publishing to exchange with routing key ${routingKey}:`, error);
      throw error;
    }
  }

  // Helper method to check connection health
  async isConnected(): Promise<boolean> {
    return this.emailClient !== undefined && this.pushClient !== undefined;
  }
}
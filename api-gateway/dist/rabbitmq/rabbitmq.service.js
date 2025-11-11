"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RabbitMQService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
let RabbitMQService = RabbitMQService_1 = class RabbitMQService {
    logger = new common_1.Logger(RabbitMQService_1.name);
    emailClient;
    pushClient;
    async onModuleInit() {
        try {
            this.emailClient = microservices_1.ClientProxyFactory.create({
                transport: microservices_1.Transport.RMQ,
                options: {
                    urls: ['amqp://guest:guest@rabbitmq:5672'],
                    queue: 'email.queue',
                    queueOptions: {
                        durable: true,
                    },
                },
            });
            this.pushClient = microservices_1.ClientProxyFactory.create({
                transport: microservices_1.Transport.RMQ,
                options: {
                    urls: ['amqp://guest:guest@rabbitmq:5672'],
                    queue: 'push.queue',
                    queueOptions: {
                        durable: true,
                    },
                },
            });
            await this.emailClient.connect();
            await this.pushClient.connect();
            this.logger.log('RabbitMQ clients connected successfully');
        }
        catch (error) {
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
        }
        catch (error) {
            this.logger.error('Error closing RabbitMQ clients:', error);
        }
    }
    async sendToEmailQueue(message) {
        try {
            if (!this.emailClient) {
                throw new Error('Email client not connected');
            }
            const sent = this.emailClient.emit('send_email', message);
            this.logger.log(`Message sent to email queue: ${JSON.stringify(message)}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error sending message to email queue:', error);
            throw error;
        }
    }
    async sendToPushQueue(message) {
        try {
            if (!this.pushClient) {
                throw new Error('Push client not connected');
            }
            const sent = this.pushClient.emit('send_push', message);
            this.logger.log(`Message sent to push queue: ${JSON.stringify(message)}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error sending message to push queue:', error);
            throw error;
        }
    }
    async publishToExchange(routingKey, message) {
        try {
            if (routingKey === 'email') {
                return this.sendToEmailQueue(message);
            }
            else if (routingKey === 'push') {
                return this.sendToPushQueue(message);
            }
            else {
                throw new Error(`Unknown routing key: ${routingKey}`);
            }
        }
        catch (error) {
            this.logger.error(`Error publishing to exchange with routing key ${routingKey}:`, error);
            throw error;
        }
    }
    async isConnected() {
        return this.emailClient !== undefined && this.pushClient !== undefined;
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = RabbitMQService_1 = __decorate([
    (0, common_1.Injectable)()
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map
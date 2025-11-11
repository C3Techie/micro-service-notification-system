import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private emailClient;
    private pushClient;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    sendToEmailQueue(message: any): Promise<boolean>;
    sendToPushQueue(message: any): Promise<boolean>;
    publishToExchange(routingKey: string, message: any): Promise<boolean>;
    isConnected(): Promise<boolean>;
}

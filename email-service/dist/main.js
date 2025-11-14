"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const email_module_1 = require("./email/email.module");
async function bootstrap() {
    const logger = new common_1.Logger('EmailService');
    const app = await core_1.NestFactory.create(email_module_1.EmailModule);
    const port = process.env.PORT || 3004;
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
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
//# sourceMappingURL=main.js.map
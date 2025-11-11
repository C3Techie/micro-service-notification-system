import { CreateNotificationDto } from './dto/create-notification.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import type { ApiResponse as ApiResponseInterface } from '../common/interfaces/api-response.interface';
export declare class NotificationsController {
    private readonly rabbitMQService;
    private readonly logger;
    constructor(rabbitMQService: RabbitMQService);
    sendNotification(createNotificationDto: CreateNotificationDto): Promise<ApiResponseInterface<NotificationResponseDto>>;
    private validateNotificationRequest;
    health(): ApiResponseInterface<{
        status: string;
        timestamp: string;
    }>;
}

import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  HttpException, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto, NotificationType } from './dto/create-notification.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import type { ApiResponse as ApiResponseInterface } from '../common/interfaces/api-response.interface';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('notifications')
@Controller('api/v1/notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @Post()
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 201, description: 'Notification queued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<ApiResponseInterface<NotificationResponseDto>> {
    try {
      this.logger.log(`Received notification request: ${createNotificationDto.request_id}`);

      // Validate request (basic validation handled by class-validator)
      await this.validateNotificationRequest(createNotificationDto);

      // Route to appropriate queue
      const routingKey = createNotificationDto.notification_type;
      const notificationId = uuidv4();
      
      const message = {
        ...createNotificationDto,
        notification_id: notificationId,
        timestamp: new Date().toISOString(),
      };

      // Send to RabbitMQ exchange
      const sent = await this.rabbitMQService.publishToExchange(
        'notifications.direct',
        routingKey,
        message
      );

      if (!sent) {
        throw new Error('Failed to queue notification');
      }

      this.logger.log(`Notification routed to ${routingKey} queue: ${notificationId}`);

      const responseData: NotificationResponseDto = {
        notification_id: notificationId,
        status: 'pending',
        request_id: createNotificationDto.request_id,
      };

      return {
        success: true,
        data: responseData,
        message: 'Notification queued successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to process notification: ${error.message}`);
      
      throw new HttpException(
        {
          success: false,
          error: error.message,
          message: 'Failed to process notification request',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async validateNotificationRequest(dto: CreateNotificationDto): Promise<void> {
    // Additional business logic validation can go here
    if (!dto.request_id) {
      throw new Error('request_id is required for idempotency');
    }

    if (!dto.user_id) {
      throw new Error('user_id is required');
    }

    // Add more validation as needed
  }

  @Get('health')
  @ApiOperation({ summary: 'API Gateway health check' })
  health(): ApiResponseInterface<{ status: string; timestamp: string }> {
    return {
      success: true,
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
      },
      message: 'API Gateway is healthy',
    };
  }
}
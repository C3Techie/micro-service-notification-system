import { Controller, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { NotificationStatus } from '../shared/interfaces/notification.interface';

@Controller()
@UsePipes(new ValidationPipe({ 
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true 
}))
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @MessagePattern('email.queue')
  async handleEmailNotification(@Payload() data: SendEmailDto): Promise<void> {
    this.logger.log(`Received message for email notification: ${data.request_id}`);
    
    // Add null checks since properties are optional in TypeScript
    if (!data.request_id || !data.user_id || !data.template_code) {
      this.logger.error('Missing required fields in notification data');
      throw new Error('Invalid notification data: missing required fields');
    }

    try {
      await this.emailService.sendEmail(data as Required<SendEmailDto>);
      await this.emailService.updateNotificationStatus(data.request_id, NotificationStatus.DELIVERED);
      this.logger.log(`Successfully processed email notification: ${data.request_id}`);
    } catch (error) {
      this.logger.error(`Failed to process email notification: ${data.request_id}`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.emailService.updateNotificationStatus(
        data.request_id, 
        NotificationStatus.FAILED, 
        errorMessage
      );
      
      throw error;
    }
  }
}
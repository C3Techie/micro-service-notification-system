import { IsString, IsUUID, IsObject, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { NotificationType } from '../../shared/interfaces/notification.interface';

export class SendEmailDto {
  @IsEnum(NotificationType)
  notification_type?: NotificationType;

  @IsUUID()
  user_id?: string;

  @IsString()
  template_code?: string;

  @IsObject()
  variables?: Record<string, any>;

  @IsString()
  request_id?: string;

  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
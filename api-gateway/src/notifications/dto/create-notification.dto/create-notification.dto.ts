import { IsEnum, IsUUID, IsString, IsObject, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
}

export class UserData {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsUrl()
  link: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  meta?: Record<string, any>;
}

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  @IsString()
  template_code: string;

  @ApiProperty()
  @IsObject()
  variables: UserData;

  @ApiProperty()
  @IsString()
  request_id: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
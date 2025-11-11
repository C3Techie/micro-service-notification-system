import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty()
  notification_id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  request_id: string;
}
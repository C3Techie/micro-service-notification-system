import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePushTokenDto {
  @ApiProperty({ description: 'Device push notification token' })
  @IsString()
  @IsNotEmpty()
  push_token: string;
}

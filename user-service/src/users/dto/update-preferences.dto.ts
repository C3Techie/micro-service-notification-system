import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({ description: 'Enable/disable email notifications' })
  @IsBoolean()
  email: boolean;

  @ApiProperty({ description: 'Enable/disable push notifications' })
  @IsBoolean()
  push: boolean;
}

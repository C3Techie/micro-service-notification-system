import { ApiProperty } from '@nestjs/swagger';

export class UserPreferenceResponse {
  @ApiProperty()
  email: boolean;

  @ApiProperty()
  push: boolean;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  push_token?: string;

  @ApiProperty()
  preferences: UserPreferenceResponse;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
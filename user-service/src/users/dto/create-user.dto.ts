import { IsEmail, IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserPreference {
  @ApiProperty({ default: true })
  @IsBoolean()
  email: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  push: boolean;
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  push_token?: string;

  @ApiProperty()
  @IsObject()
  preferences: UserPreference;

  @ApiProperty()
  @IsString()
  password: string;
}
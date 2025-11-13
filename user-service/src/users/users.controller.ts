import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Put, 
  HttpException, 
  HttpStatus,
  Logger,
  ParseUUIDPipe 
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { ApiResponse as ApiResponseInterface } from '../common/interfaces/api-response.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User with email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponseInterface<UserResponseDto>> {
    try {
      this.logger.log(`Creating user: ${createUserDto.email}`);

      const user = await this.usersService.create(createUserDto);

      return {
        success: true,
        data: user,
        message: 'User created successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          error: error.message,
          message: 'Failed to create user',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(): Promise<ApiResponseInterface<UserResponseDto[]>> {
    try {
      const users = await this.usersService.findAll();

      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully',
        meta: {
          total: users.length,
          limit: users.length,
          page: 1,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw error;
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'User Service health check' })
  health(): ApiResponseInterface<{ status: string; timestamp: string }> {
    return {
      success: true,
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
      },
      message: 'User Service is healthy',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseInterface<UserResponseDto>> {
    try {
      const user = await this.usersService.findOne(id);

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to fetch user ${id}: ${error.message}`);
      throw error;
    }
  }

  @Put(':id/preferences')
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePreferences(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() preferences: { email: boolean; push: boolean },
  ): Promise<ApiResponseInterface<UserResponseDto>> {
    try {
      const user = await this.usersService.updatePreferences(id, preferences);

      return {
        success: true,
        data: user,
        message: 'User preferences updated successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to update preferences for user ${id}: ${error.message}`);
      throw error;
    }
  }

  @Put(':id/push-token')
  @ApiOperation({ summary: 'Update user push token' })
  @ApiParam({ name: 'id', type: String, description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Push token updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePushToken(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('push_token') pushToken: string,
  ): Promise<ApiResponseInterface<UserResponseDto>> {
    try {
      const user = await this.usersService.updatePushToken(id, pushToken);

      return {
        success: true,
        data: user,
        message: 'Push token updated successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to update push token for user ${id}: ${error.message}`);
      throw error;
    }
  }
}
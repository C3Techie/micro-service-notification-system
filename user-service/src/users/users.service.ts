import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      push_token: user.push_token,
      preferences: user.preferences,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      this.logger.log(`Creating user: ${createUserDto.email}`);

      // Check if user already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create new user
      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(`User created successfully: ${savedUser.id}`);

      return this.toResponseDto(savedUser);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.usersRepository.find({
        order: { created_at: 'DESC' },
      });
      return users.map(user => this.toResponseDto(user));
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error(`Failed to fetch user ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(`Failed to find user by email ${email}: ${error.message}`);
      throw error;
    }
  }

  async updatePreferences(id: string, preferences: { email: boolean; push: boolean }): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      user.preferences = preferences;
      const updatedUser = await this.usersRepository.save(user);

      this.logger.log(`User preferences updated: ${id}`);

      return this.toResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(`Failed to update user preferences ${id}: ${error.message}`);
      throw error;
    }
  }

  async updatePushToken(id: string, pushToken: string): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      user.push_token = pushToken;
      const updatedUser = await this.usersRepository.save(user);

      this.logger.log(`User push token updated: ${id}`);

      return this.toResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(`Failed to update user push token ${id}: ${error.message}`);
      throw error;
    }
  }
}
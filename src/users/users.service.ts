import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChangePasswordDto, RegisterDto, UpdateUserDto } from '../dtos';
import { User } from '../entities';
import * as argon from 'argon2';

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: RegisterDto) {
    const isPasswordConfirmed = this.confirmPassword(
      dto.password,
      dto.confirmPassword,
    );
    if (!isPasswordConfirmed)
      throw new BadRequestException('passwords do not match');
    try {
      const hashedPassword = await argon.hash(dto.password);
      const userObject = this.userRepository.create({
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      });
      return await this.userRepository.save(userObject);
    } catch (error) {
      this.logger.error(error);
      if (this.isDatabaseError(error)) {
        if (error.code === '23505') {
          if (error.constraint?.includes('email')) {
            throw new ConflictException('this email already exist');
          }
          if (error.constraint?.includes('username')) {
            throw new ConflictException('this username already exist');
          }
        }
      }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('error creating user');
    }
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email },
        select: {
          id: true,
          password: true,
          role: true,
          username: true,
          isBlocked: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('error fetching user by email');
    }
  }

  async getRefreshTokensById(id: string) {
    try {
      return await this.userRepository.findOne({
        where: { id },
        select: {
          id: true,
          role: true,
          refreshTokens: true,
          isBlocked: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('error fetching user tokens');
    }
  }

  async updateRefreshTokens(id: string, refreshToken: string | null) {
    try {
      let hashedToken: null | string = null;
      if (refreshToken) {
        hashedToken = await argon.hash(refreshToken);
      }
      const result = await this.userRepository.update(id, {
        refreshTokens: hashedToken,
      });

      if (result.affected === 0) throw new UnauthorizedException();
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('error updating user tokens');
    }
  }

  async getUserById(id: string) {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('error fetching user by id');
    }
  }

  async getUserByIdWithPassword(id: string) {
    try {
      return await this.userRepository.findOne({
        where: { id },
        select: { password: true, isBlocked: true },
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('error fetching user by id');
    }
  }

  async getBLockedUser(userId: string) {
    return await this.userRepository.findOne({
      where: {
        id: userId,
        isBlocked: true,
      },
    });
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    try {
      const user = await this.getUserById(userId);
      if (!user) throw new NotFoundException('user not found');
      user.username = dto.username ?? user.username;
      user.email = dto.email ?? user.email;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error updating user');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      const user = await this.getUserByIdWithPassword(userId);
      if (!user) throw new NotFoundException('user not found');
      const isOldPasswordMatch = await argon.verify(
        user.password,
        dto.oldPassword,
      );
      if (!isOldPasswordMatch) throw new BadRequestException('wrong password');
      if (dto.newPassword !== dto.confirmPassword)
        throw new BadRequestException('passwords do not match');
      const hashedNewPassword = await argon.hash(dto.newPassword);
      user.password = hashedNewPassword;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error updating user password');
    }
  }

  //   helper functions
  confirmPassword(password: string, confirmPassword: string) {
    return password === confirmPassword;
  }

  isDatabaseError(
    error: unknown,
  ): error is { code: string; constraint?: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
  }
}

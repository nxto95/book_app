import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from '../dtos';
import { User } from '../entities';
import * as argon from 'argon2';

@Injectable()
export class UsersService {
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
      throw error;
    }
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true, role: true, username: true },
    });
  }

  async getRefreshTokensById(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        role: true,
        refreshTokens: true,
      },
    });
  }

  async updateRefreshTokens(id: string, refreshToken: string | null) {
    let hashedToken: null | string = null;
    if (refreshToken) {
      hashedToken = await argon.hash(refreshToken);
    }
    const result = await this.userRepository.update(id, {
      refreshTokens: hashedToken,
    });

    if (result.affected === 0) throw new UnauthorizedException();
  }

  async getUserById(id: string) {
    return await this.userRepository.findOneBy({ id });
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

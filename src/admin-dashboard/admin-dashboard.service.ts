import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book, User } from '../entities';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class AdminDashboardService {
  logger = new Logger(AdminDashboardService.name);
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getStatus() {
    const [totalUsers, blockedUsers, totalExistingBooks, totalDeletedBooks] =
      await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { isBlocked: true } }),
        this.bookRepository.count(),
        this.bookRepository.count({
          where: {
            deletedAt: Not(IsNull()),
          },
          withDeleted: true,
        }),
      ]);

    const totalBooks = totalExistingBooks + totalDeletedBooks;
    const unBlockedUsers = totalUsers - blockedUsers;
    return {
      unBlockedUsers,
      blockedUsers,
      totalUsers,
      totalExistingBooks,
      totalDeletedBooks,
      totalBooks,
    };
  }

  async hardDeleteBook(bookId: string) {
    try {
      const result = await this.bookRepository.delete({ id: bookId });
      if (result.affected === 0) throw new NotFoundException('book not found');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error deleting book');
    }
  }

  async softDeleteBook(bookId: string) {
    try {
      const result = await this.bookRepository.softDelete({ id: bookId });
      if (result.affected === 0) throw new NotFoundException('book not found');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error deleting book');
    }
  }

  async restoreAnyBook(bookId: string) {
    try {
      const result = await this.bookRepository.restore({
        id: bookId,
      });
      if (result.affected === 0)
        throw new NotFoundException('book not found or not deleted already');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error restoring book');
    }
  }

  async restoreAnyUser(userId: string) {
    try {
      const result = await this.userRepository.restore({
        id: userId,
      });
      if (result.affected === 0)
        throw new NotFoundException('user not found or not deleted already');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error restoring user');
    }
  }
  async hardDeleteUser(userId: string) {
    try {
      const result = await this.userRepository.delete({ id: userId });
      if (result.affected === 0) throw new NotFoundException('user not found');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error deleting user');
    }
  }

  async softDeleteUser(userId: string) {
    try {
      const result = await this.userRepository.softDelete({ id: userId });
      if (result.affected === 0) throw new NotFoundException('user not found');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error deleting user');
    }
  }
  async blockUser(userId: string) {
    try {
      const result = await this.userRepository.update(
        {
          id: userId,
          isBlocked: false,
        },
        { isBlocked: true },
      );
      if (result.affected === 0)
        throw new NotFoundException('user not found or already blocked');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error blocking user');
    }
  }
  async unblockUser(userId: string) {
    try {
      const result = await this.userRepository.update(
        {
          id: userId,
          isBlocked: true,
        },
        { isBlocked: false },
      );
      if (result.affected === 0)
        throw new NotFoundException('user not found or already unblocked');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error unblocking user');
    }
  }
}

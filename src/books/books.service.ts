import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../entities';
import { Repository, Not, IsNull } from 'typeorm';
import { CreateBookDto, UpdateBookDto } from '../dtos';

@Injectable()
export class BooksService {
  logger = new Logger(BooksService.name);
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {}

  async create(userId: string, dto: CreateBookDto) {
    try {
      const bookObj = this.bookRepository.create({
        ...dto,
        userId,
      });
      return await this.bookRepository.save(bookObj);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('error creating new book');
    }
  }

  async delete(userId: string, bookId: string) {
    try {
      const result = await this.bookRepository.softDelete({
        id: bookId,
        userId,
      });
      if (result.affected === 0) throw new NotFoundException('book not found');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error deleting the book');
    }
  }

  async update(userId: string, bookId: string, dto: UpdateBookDto) {
    try {
      const result = await this.bookRepository.update(
        {
          id: bookId,
          userId,
        },
        dto,
      );
      if (result.affected === 0) throw new NotFoundException('book not found');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error updating the book');
    }
  }

  async restore(userId: string, bookId: string) {
    try {
      const result = await this.bookRepository.restore({
        id: bookId,
        userId,
      });

      if (result.affected === 0) {
        throw new NotFoundException('book not found in trash');
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error restoring the book');
    }
  }
  async getAll(userId: string) {
    try {
      const [books, count] = await this.bookRepository.findAndCount({
        where: {
          userId,
        },
      });
      if (!books || count === 0)
        throw new NotFoundException('user has no books yet');
      return { books, count };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error fetching books');
    }
  }

  async getOne(userId: string, bookId: string) {
    try {
      const book = await this.bookRepository.findOne({
        where: { id: bookId, userId },
      });
      if (!book) throw new NotFoundException('book not found');
      return book;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error fetching book');
    }
  }

  async getDeleted(userId: string) {
    try {
      const [books, count] = await this.bookRepository.findAndCount({
        where: {
          userId,
          deletedAt: Not(IsNull()),
        },
        withDeleted: true,
      });
      if (!books || count === 0)
        throw new NotFoundException('user has no books yet');
      return { books, count };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('error fetching deleted book');
    }
  }
}

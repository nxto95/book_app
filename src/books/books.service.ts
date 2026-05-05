import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../entities';
import { Repository } from 'typeorm';
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
}

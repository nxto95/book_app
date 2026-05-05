import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { AccessGuard, RoleGuard } from '../auth/guards';
import { URole } from '../auth/decorators/user-role.decorator';
import { type IAccessStrategyUser, UserRole } from '../types';
import { CurrentUser } from '../auth/decorators';
import { CreateBookDto, UpdateBookDto } from '../dtos';

@Controller('books')
@UseGuards(AccessGuard, RoleGuard)
@URole(UserRole.ADMIN, UserRole.USER)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(
    @CurrentUser() user: IAccessStrategyUser,
    @Body() dto: CreateBookDto,
  ) {
    return await this.booksService.create(user.id, dto);
  }

  @Get('my-books')
  async getAll(@CurrentUser() user: IAccessStrategyUser) {
    return await this.booksService.getAll(user.id);
  }

  @Get('my-trash')
  async getDeleted(@CurrentUser() user: IAccessStrategyUser) {
    return await this.booksService.getDeleted(user.id);
  }

  @Get(':id')
  async getOne(
    @CurrentUser() user: IAccessStrategyUser,
    @Param('id') id: string,
  ) {
    return await this.booksService.getOne(user.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: IAccessStrategyUser,
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return await this.booksService.update(user.id, id, dto);
  }
  @Patch(':id/restore')
  async restore(
    @CurrentUser() user: IAccessStrategyUser,
    @Param('id') id: string,
  ) {
    return await this.booksService.restore(user.id, id);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: IAccessStrategyUser,
    @Param('id') id: string,
  ) {
    return await this.booksService.delete(user.id, id);
  }
}

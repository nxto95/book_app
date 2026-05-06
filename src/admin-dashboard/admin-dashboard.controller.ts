import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AccessGuard, RoleGuard } from '../auth/guards';
import { URole } from '../auth/decorators/user-role.decorator';
import { UserRole } from '../types';

@Controller('admin/dashboard')
@UseGuards(AccessGuard, RoleGuard)
@URole(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  // Metric related routes
  @Get('status')
  async getStatus() {
    return await this.adminDashboardService.getStatus();
  }

  // Books related routes
  @Delete('books/:id/hard-delete')
  async hardDeleteBook(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminDashboardService.hardDeleteBook(id);
  }

  @Delete('books/:id/soft-delete')
  async softDeleteBook(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminDashboardService.softDeleteBook(id);
  }

  @Patch('books/:id/restore')
  async restoreAnyBook(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminDashboardService.restoreAnyBook(id);
  }

  // Users related routes
  @Delete('users/:id/hard-delete')
  async hardDeleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminDashboardService.hardDeleteUser(id);
  }

  @Delete('users/:id/soft-delete')
  async softDeleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminDashboardService.softDeleteUser(id);
  }

  @Patch('users/:id/restore')
  async restoreAnyUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminDashboardService.restoreAnyUser(id);
  }

  @Patch('users/:id/block')
  async blockUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminDashboardService.blockUser(id);
  }

  @Patch('users/:id/unblock')
  async unblockUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminDashboardService.unblockUser(id);
  }
}

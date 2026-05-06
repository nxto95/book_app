import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { AuthModule } from './auth/auth.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { APP_GUARD } from '@nestjs/core';
import { IsBlockedGuard } from './auth/guards/blocked.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const isDev = config.getOrThrow('NODE_ENV') === 'development';
        return {
          type: 'postgres',
          host: config.getOrThrow('POSTGRES_HOST'),
          port: config.getOrThrow('POSTGRES_PORT'),
          username: config.getOrThrow('POSTGRES_USER'),
          password: config.getOrThrow('POSTGRES_PASSWORD'),
          database: config.getOrThrow('POSTGRES_DB'),
          autoLoadEntities: true,
          synchronize: isDev,
          logging: isDev,
        };
      },
    }),
    UsersModule,
    BooksModule,
    AuthModule,
    AdminDashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: IsBlockedGuard,
    },
  ],
})
export class AppModule {}

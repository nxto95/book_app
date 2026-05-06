import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

function NormalizeString() {
  return Transform(({ value }): string =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}

export class RegisterDto {
  @NormalizeString()
  @IsString()
  @Length(2, 64)
  username: string;
  @NormalizeString()
  @IsEmail()
  email: string;
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string;
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class UpdateUserDto {
  @NormalizeString()
  @IsString()
  @Length(2, 64)
  @IsOptional()
  username?: string;
  @NormalizeString()
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class CreateBookDto {
  @NormalizeString()
  @IsString()
  @IsNotEmpty()
  title: string;
  @NormalizeString()
  @IsString()
  @IsNotEmpty()
  author: string;
  @NormalizeString()
  @IsString()
  @IsNotEmpty()
  genre: string;
  @IsNumber()
  @IsNotEmpty()
  publishedYear: number;
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  newPassword: string;
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

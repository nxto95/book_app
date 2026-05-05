import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

function NormalizeString() {
  return Transform(({ value }): string =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}

export class RegisterDto {
  @NormalizeString()
  @IsString()
  @IsOptional()
  username?: string;
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

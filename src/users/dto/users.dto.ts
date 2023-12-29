import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsEmail()
  email: string;
}

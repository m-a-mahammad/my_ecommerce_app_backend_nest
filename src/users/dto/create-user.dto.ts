import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'First Name should have a minimum of 3 characters' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$])[A-Za-z0-9@#$]{8,}$/)
  password: string;
}

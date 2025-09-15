import { CreateUserDto } from './create-user.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'src/enums/user-role.enum';
import { OmitType, PartialType } from '@nestjs/mapped-types';

class UpdateImageDto {
  @IsUrl()
  url?: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const),
) {
  @ValidateNested()
  @Type(() => UpdateImageDto)
  image?: UpdateImageDto;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$])[A-Za-z0-9@#$]{8,}$/)
  currentPassword?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: string;
}

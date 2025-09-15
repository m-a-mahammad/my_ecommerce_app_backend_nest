import { Exclude, Expose, Type } from 'class-transformer';

class UpdateImageDto {
  url?: string;
}

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  @Type(() => UpdateImageDto)
  image?: UpdateImageDto;
}

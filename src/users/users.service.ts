import { plainToInstance } from 'class-transformer';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getAllUsersService(): Promise<ResponseFormItf<UserResponseDto[]>> {
    const users = await this.usersRepository.find();
    return {
      data: plainToInstance(UserResponseDto, users) as UserResponseDto[],
    };
  }
}

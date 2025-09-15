import { plainToInstance } from 'class-transformer';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getUserService(id: number): Promise<ResponseFormItf<UserResponseDto>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return { data: plainToInstance(UserResponseDto, user) as UserResponseDto };
  }
}

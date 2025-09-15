import { plainToInstance } from 'class-transformer';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { compare, hash } from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';

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

  async registerUserService(
    createUserDto: CreateUserDto,
  ): Promise<ResponseFormItf<UserResponseDto>> {
    const { name, email, password } = createUserDto;

    switch (true) {
      case !name:
        throw new BadRequestException(`Name field is required`);
      case !email:
        throw new BadRequestException(`Email field is required`);
      case !password:
        throw new BadRequestException(`Password field is required`);
    }

    const userExists = await this.usersRepository.findOne({
      where: { email },
    });

    if (userExists) {
      throw new BadRequestException(
        'Email has already been used. kindly, change your email.',
      );
    }

    const hashedPassword = await hash(password, 10);
    createUserDto.password = hashedPassword;
    const user = this.usersRepository.create(createUserDto);
    const registeredUser = await this.usersRepository.save(user);

    return {
      data: plainToInstance(UserResponseDto, registeredUser) as UserResponseDto,
      message: 'User registered successfully',
    };
  }

  async loginUserService(
    userData: LoginUserDto,
  ): Promise<ResponseFormItf<UserResponseDto>> {
    const { email, password } = userData;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (typeof password === 'string') {
      const isPasswordMatch = await compare(password, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    return {
      data: plainToInstance(UserResponseDto, user) as UserResponseDto,
      message: 'User logged in successfully',
    };
  }
}

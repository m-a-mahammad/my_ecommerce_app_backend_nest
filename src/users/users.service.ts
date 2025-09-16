import { plainToInstance } from 'class-transformer';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import {
  BadRequestException,
  ForbiddenException,
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
import { UpdateUserDto } from './dto/update-user.dto';
import { join } from 'path';
import { existsSync, unlink } from 'fs';

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

  async updateUserService(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseFormItf<UserResponseDto>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let password = updateUserDto.password;
    let currentPassword = updateUserDto.currentPassword;

    if (password && currentPassword) {
      if (!(await compare(currentPassword, user.password))) {
        throw new UnauthorizedException('Password invailed');
      } else {
        const hashedPassword = await hash(password, 10);
        password = hashedPassword;
        currentPassword = password;
      }
    } else if (password && !currentPassword) {
      throw new BadRequestException(`Current password field is required`);
    }

    if ('role' in updateUserDto) {
      throw new ForbiddenException('You are not allowed to update your role');
    }

    delete updateUserDto.password;
    Object.assign(user, updateUserDto, password ? { password } : {});

    const updatedUser = await this.usersRepository.save(user);
    return {
      data: plainToInstance(UserResponseDto, updatedUser) as UserResponseDto,
      message: 'User updated successfully',
    };
  }

  async updateUserRoleService(
    id: number,
    updateUserDto: UpdateUserDto,
    userId: number,
  ): Promise<ResponseFormItf<UserResponseDto>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (id === userId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const { role } = updateUserDto;
    if (role) {
      user.role = role;
    }

    const updatedUser = await this.usersRepository.save(user);
    return {
      data: plainToInstance(UserResponseDto, updatedUser) as UserResponseDto,
      message: 'User role updated successfully',
    };
  }

  async updateUserImageService(
    updateUserDto: UpdateUserDto,
    protocol: string,
    host: string,
    file: Express.Multer.File,
    userId: number,
  ): Promise<ResponseFormItf<UserResponseDto>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updates = { ...updateUserDto };
    if (file) {
      const oldFileName = user.image.url?.split('/').pop();
      if (oldFileName) {
        const oldPath = join('uploads', oldFileName);
        if (existsSync(oldPath)) {
          unlink(oldPath, (err) => {
            if (err) console.warn('Failed to delete image: ', err.message);
            else console.log('Image deleted successfully 🧹');
          });
        }
      }

      updates.image = {
        url: `${protocol}://${host}/uploads/${file.filename}`,
      };
    }

    Object.assign(user, updates);
    const updatedUser = await this.usersRepository.save(user);

    return {
      data: plainToInstance(UserResponseDto, updatedUser) as UserResponseDto,
      message: 'User image updated successfully',
    };
  }

  async deleteUserService(
    id: number,
  ): Promise<ResponseFormItf<UserResponseDto>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deletedUser = await this.usersRepository.remove(user);
    return {
      data: plainToInstance(UserResponseDto, deletedUser) as UserResponseDto,
      message: 'User deleted successfully',
    };
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { SetAuthCookieInterceptor } from 'src/interceptors/set-auth-cookie.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAllUsersService();
    return users;
  }

  @Get('id/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.getUserService(+id);
    return user;
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  @UseInterceptors(SetAuthCookieInterceptor)
  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.registerUserService(createUserDto);
    if (!user) {
      throw new BadRequestException('Failed to register user');
    }

    return user;
  }

  @UseInterceptors(SetAuthCookieInterceptor)
  @Post('login')
  async loginUser(@Body() userData: LoginUserDto) {
    const user = await this.usersService.loginUserService(userData);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}

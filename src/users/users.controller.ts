import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { SetAuthCookieInterceptor } from 'src/interceptors/set-auth-cookie.interceptor';
import { RequestWithCookies } from 'src/interfaces/request-with-cookies.interface';
import { isProduction } from 'src/utils/constants';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Delete('logout')
  @UseGuards(AuthGuard)
  logoutUser(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.userId;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const token = req.cookies.token;
    if (!token) {
      throw new UnauthorizedException('User not logged in');
    }

    res.clearCookie('token', {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction ? true : false,
    });

    return { message: 'User logged out successfully' };
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateUser(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const user = await this.usersService.updateUserService(
      +userId,
      updateUserDto,
    );
    return user;
  }
}

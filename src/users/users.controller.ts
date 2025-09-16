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
  UploadedFile,
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
import { UserRole } from 'src/enums/user-role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAllUsersService();
    return users;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('id/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.getUserService(+id);
    return user;
  }

  @UseGuards(AuthGuard)
  @Get('me')
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

  @UseGuards(AuthGuard)
  @Delete('logout')
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

  @UseGuards(AuthGuard)
  @Patch('me')
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('id/:id')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    if (!updateUserDto.role)
      throw new BadRequestException('Role field is required');

    const updatedUser = await this.usersService.updateUserRoleService(
      +id,
      updateUserDto,
      +userId,
    );
    return updatedUser;
  }

  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @UseGuards(AuthGuard)
  @Patch('me/image')
  async updateUserImage(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.userId;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    const host = req.headers.host || `localhost:${process.env.PORT}`;
    const protocol = req.protocol;
    const updatedUser = await this.usersService.updateUserImageService(
      updateUserDto,
      protocol,
      host,
      file,
      Number(userId),
    );
    return updatedUser;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('id/:id')
  async deleteUser(@Param('id') id: string) {
    const message = await this.usersService.deleteUserService(+id);
    return message;
  }
}

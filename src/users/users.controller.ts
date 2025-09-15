import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

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
}

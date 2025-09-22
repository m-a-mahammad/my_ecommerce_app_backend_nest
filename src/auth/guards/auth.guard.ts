import { ConfigService } from '@nestjs/config';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { RequestWithCookies } from 'src/interfaces/request-with-cookies.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const httpRequest = ctx.getRequest<RequestWithCookies>();
    const token = httpRequest.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('Unauthorized user');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret)
        throw new Error('JWT_SECRET is not defined in environment variables');
      const payload = verify(token, jwtSecret) as JwtPayload;

      if (typeof payload === 'object' && 'userId' in payload) {
        httpRequest.userId = payload.userId;
      }

      const user = await this.usersService.getUserService(
        Number(payload.userId),
      );

      if (!user) {
        throw new UnauthorizedException(
          'The user belonging to this token no longer exists.',
        );
      }

      httpRequest.user = user.data;
    } catch (error) {
      const logger = new Logger(AuthGuard.name);
      logger.error('JWT verification failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}

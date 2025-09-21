import { ConfigService } from '@nestjs/config';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { sign } from 'jsonwebtoken';
import { Observable, tap } from 'rxjs';
import { authCookieOptions } from 'src/config/cookie.config';
import { ResponseFormItf } from 'src/interfaces/response-form.interface';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@Injectable()
export class SetAuthCookieInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap((data: ResponseFormItf<UserResponseDto>) => {
        if (data?.data?.id) {
          const jwtSecret = this.configService.get<string>('JWT_SECRET');
          if (!jwtSecret)
            throw new Error(
              'JWT_SECRET is not defined in environment variables',
            );
          const token = sign({ userId: data.data.id }, jwtSecret, {
            expiresIn: '7d',
          });

          response.cookie('token', token, authCookieOptions);
        }
      }),
    );
  }
}

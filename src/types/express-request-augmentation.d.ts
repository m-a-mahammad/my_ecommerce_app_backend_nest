import { UserResponseDto } from 'src/users/dto/user-response.dto';

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDto;
      userId?: string;
    }
  }
}

export {};

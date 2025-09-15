import { Request } from 'express';

export interface RequestWithCookies extends Request {
  cookies: {
    token?: string;
    [key: string]: string | undefined;
  };
}

import { CookieOptions } from 'express';
import { isProduction } from 'src/utils/constants';

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction ? true : false,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
};

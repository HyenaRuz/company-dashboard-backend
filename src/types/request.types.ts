import { Request } from 'express';

type TUserFromToken = {
  id: number;
  username: string;
  role: string;
  refreshToken?: string;
};

type TRequest = Request & {
  user: TUserFromToken;
};

export type { TUserFromToken, TRequest };

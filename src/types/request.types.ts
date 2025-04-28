import { Request } from 'express';

type TUserFromToken = {
  id: number;
  username: string;
  role: string;
  refreshToken?: string;
};

type TRequest = Request & {
  user: TUserFromToken;
  createdEntity?: {
    id: number;
    ownerId: number;
    type: 'company' | 'account';
  };
};

export type { TUserFromToken, TRequest };

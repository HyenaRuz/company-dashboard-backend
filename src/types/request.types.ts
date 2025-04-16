// import {
//   Account,
//   AccountStoreRegionPreferences,
//   Region,
//   Store,
// } from '@prisma/client';
import { Request } from 'express';

type TUserFromToken = {
  id: number;
  username: string;
  refreshToken?: string;
};

type TRequest = Request & {
  user: TUserFromToken;
};

// type TRequestWithAccount = Request & {
//   extractedAccount?: Account & {
//     storeRegionPreferences: (AccountStoreRegionPreferences & {
//       store: Store;
//       region: Region;
//     })[];
//   };
// };

export type { TUserFromToken, TRequest };

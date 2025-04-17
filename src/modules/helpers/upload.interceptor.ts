import {
    FileInterceptor,
  } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { v4 as uuidv4 } from 'uuid';
  import { extname } from 'path';
  
  export const createUploadInterceptor = (
    fieldName: string,
    destination: string,
    allowedMimePrefix = 'image/',
  ) => {
    return FileInterceptor(fieldName, {
      storage: diskStorage({
        destination,
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const isAllowed = file.mimetype.startsWith(allowedMimePrefix);
        cb(null, isAllowed);
      },
    });
  };
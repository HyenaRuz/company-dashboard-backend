import { Module } from '@nestjs/common';

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from './email.service';

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.NODEMAILER_HOST,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      },
      defaults: {
        from: process.env.NODEMAILER_HOST,
      },
      template: {
        // dir: path.join(process.cwd(), 'dist', 'modules', 'email', 'templates'),
        dir: path.join(process.cwd(), 'src', 'modules', 'email', 'templates'),
        adapter: new HandlebarsAdapter(undefined, { inlineCssEnabled: true }),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

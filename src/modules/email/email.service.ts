import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ETemplateName } from './enums/template-name.enum';
import { TSendEmailPayload } from './types';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  private async send({ to, subject, template, context }: TSendEmailPayload) {
    try {
      const info = await this.mailerService.sendMail({
        to,
        subject,
        template,
        context: {
          frontendUrl: process.env.FRONTEND_URL,
          ...context,
        },
      });

      return info;
    } catch (err) {
      console.error('Error sending email', err);
      throw err;
    }
  }

  public sendEmailVerificationCode = ({
    email,
    code,
  }: {
    email: string;
    code: string | number;
  }) => {
    console.info(
      `[Send email verification code]: email: ${email}; code: ${code}`,
    );
    const info = this.send({
      to: email,
      subject: `Game Price Pulse email verification`,
      template: ETemplateName.EMAIL_VERIFICATION_CODE,
      context: {
        code,
      },
    });

    return info;
  };

  public sendResetPasswordEmail = ({
    email,
    token,
  }: {
    email: string;
    token: string;
  }) => {
    console.info(
      `[Send reset password email]: email: ${email}; token: ${token}`,
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const info = this.send({
      to: email,
      subject: `Game Price Pulse password reset`,
      template: ETemplateName.EMAIL_RESET_PASSWORD,
      context: {
        resetLink,
      },
    });

    return info;
  };
}

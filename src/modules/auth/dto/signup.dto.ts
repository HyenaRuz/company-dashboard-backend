import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  repeatPassword: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

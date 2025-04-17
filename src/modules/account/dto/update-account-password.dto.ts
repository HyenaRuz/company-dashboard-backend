import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UpdateAccountDto } from './update-account.dto';

export class UpdateAccountPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}

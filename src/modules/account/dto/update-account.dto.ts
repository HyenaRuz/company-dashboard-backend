import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  username?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  avatarRemoved?: boolean;
}

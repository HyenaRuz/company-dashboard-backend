import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import { ERole } from 'src/enums/role.enum';

export class SearchAccountDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  id?: number;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  role?: ERole;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  sortField?: string;

  @IsString()
  @IsOptional()
  sortDirection?: 'asc' | 'desc';
}

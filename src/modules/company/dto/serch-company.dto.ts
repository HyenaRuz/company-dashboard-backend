import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class SearchCompanyDto {
  @IsString()
  @IsOptional()
  name?: '' | string;

  @IsString()
  @IsOptional()
  account?: '' | string;

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

  @IsOptional()
  @IsBoolean()
  allCompanies?: boolean;
}

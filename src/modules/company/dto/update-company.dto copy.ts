import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;

  @IsString()
  @IsOptional()
  service?: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  capital?: number;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  logoRemoved?: boolean;
}

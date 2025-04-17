import {
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

  @IsNumber()
  @IsOptional()
  capital?: number;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

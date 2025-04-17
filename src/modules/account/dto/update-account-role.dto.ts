import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UpdateAccountDto } from './update-account.dto';
import { ERole } from 'src/enums/role.enum';

export class UpdateAccountRoleDto extends UpdateAccountDto {
  @IsString()
  @IsNotEmpty()
  role: ERole;
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';

@ApiTags('Accoun')
@Controller('Accoun')
export class AccounController {
  @UseGuards(AccessTokenGuard)
  @Get('/me')
  async getUserById() {}
}

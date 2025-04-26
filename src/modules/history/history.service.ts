import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  public async getHistory() {}
  public async createHistory(data: Prisma.HistoryUncheckedCreateInput) {
    return this.prisma.history.create({ data });
  }
}

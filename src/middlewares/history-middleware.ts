import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from 'src/modules/account/account.service';
import { TRequest } from 'src/types/request.types';
import { CompanyService } from 'src/modules/company/company.service';
import { HistoryService } from 'src/modules/history/history.service';

@Injectable()
export class HistoryMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private accountService: AccountService,
    private companyService: CompanyService,
    private historyService: HistoryService,
  ) {}

  async use(req: TRequest, res: Response, next: NextFunction) {
    const trackedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    try {
      const accessToken = req.headers?.authorization?.split('Bearer ')?.[1];
      if (!accessToken) {
        next();
        return;
      }

      const decoded = (await this.jwtService.decode(accessToken)) as any;
      const actingAccount = await this.accountService.findAccountById(
        decoded.id,
      );

      const url = req.originalUrl;
      const method = req.method;
      const ip = req.ip;

      res.on('finish', async () => {
        if (
          trackedMethods.includes(method) &&
          res.statusCode >= 200 &&
          res.statusCode < 300
        ) {
          const entityInfo = req.createdEntity.id
            ? req.createdEntity
            : await this.resolveEntity(url);

          await this.historyService.createHistory({
            actingAccountId: actingAccount?.id,
            targetAccountId: entityInfo?.ownerId,
            objectCompanyId:
              entityInfo?.type === 'company' ? entityInfo.id : undefined,
            objectAccountId:
              entityInfo?.type === 'account' ? entityInfo.id : undefined,
            objectType: this.mapMethodToAction(method, url),
            ip,
          });
        }
      });

      next();
    } catch (error) {
      console.log('HistoryMiddleware error', error);
      next();
    }
  }

  private async resolveEntity(url: string) {
    const regex = /\/(company|account)\/(\d+)/;
    const match = url.match(regex);

    if (!match) return null;

    const [, type, id] = match;

    if (type === 'company') {
      const company = await this.companyService.getCompanyById(+id);
      return { id: company.id, ownerId: company.accountId, type: 'company' };
    }

    if (type === 'account') {
      const account = await this.accountService.findAccountById(+id);
      return { id: account.id, ownerId: account.id, type: 'account' };
    }

    return null;
  }

  private mapMethodToAction(method: string, url: string) {
    if (method === 'POST') return 'create';
    if (method === 'PUT') return 'update';
    if (method === 'PATCH') {
      if (url.includes('recover')) return 'recover';
      return 'update';
    }
    if (method === 'DELETE') return 'delete';
    return 'unknown';
  }
}

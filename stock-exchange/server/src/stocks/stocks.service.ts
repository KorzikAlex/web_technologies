import { Injectable } from '@nestjs/common';

@Injectable()
export class StocksService {
    getStocks(): string {
        return 'This action returns all stocks';
    }
}

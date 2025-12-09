import { Get, Module } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';

@Module({
    imports: [],
    controllers: [StocksController],
    providers: [StocksService],
})
export class StocksModule {
    constructor(private readonly stocksService: StocksService) {}

    @Get()
    getStocks(): string {
        return this.stocksService.getStocks();
    }
}

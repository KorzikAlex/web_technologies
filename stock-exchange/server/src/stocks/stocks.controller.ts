import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) {}

    @Get()
    getStocks() {
        return this.stocksService.getStocks();
    }

    @Get(':symbol')
    getStock(@Param('symbol') symbol: string) {
        const stock = this.stocksService.getStock(symbol);
        if (!stock) {
            return { message: 'Stock not found' };
        }
        return stock;
    }

    @Get(':symbol/history')
    getStockHistory(
        @Param('symbol') symbol: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const history = this.stocksService.getStockHistory(symbol, startDate, endDate);
        if (!history) {
            return { message: 'Stock not found' };
        }
        return history;
    }

    @Patch(':symbol/enabled')
    updateStockEnabled(@Param('symbol') symbol: string, @Body() body: { enabled: boolean }) {
        const stock = this.stocksService.updateStockEnabled(symbol, body.enabled);
        if (!stock) {
            return { message: 'Stock not found' };
        }
        return {
            message: 'Stock enabled status updated',
            stock,
        };
    }
}

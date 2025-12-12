import { Body, Controller, Get, Post } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeSettings } from 'src/interfaces/ExchangeSettings';

@Controller('exchange')
export class ExchangeController {
    constructor(private readonly exchangeService: ExchangeService) {}

    @Get('settings')
    getSettings() {
        return this.exchangeService.getSettings();
    }

    @Post('settings')
    updateSettings(@Body() settings: Partial<ExchangeSettings>) {
        return this.exchangeService.updateSettings(settings);
    }

    @Post('start')
    startTrading() {
        return this.exchangeService.startTrading();
    }

    @Post('stop')
    stopTrading() {
        return this.exchangeService.stopTrading();
    }

    @Get('state')
    getTradingState() {
        return this.exchangeService.getCurrentTradingState();
    }
}

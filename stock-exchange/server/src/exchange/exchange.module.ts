import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { StocksModule } from 'src/stocks/stocks.module';

@Module({
    imports: [StocksModule],
    controllers: [ExchangeController],
    providers: [ExchangeService],
    exports: [ExchangeService],
})
export class ExchangeModule {}

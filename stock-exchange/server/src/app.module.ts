import { Module } from '@nestjs/common';
import { BrokersModule } from './brokers/brokers.module';
import { SocketModule } from './socket/socket.module';
import { StocksModule } from './stocks/stocks.module';
import { ExchangeModule } from './exchange/exchange.module';

@Module({
    imports: [BrokersModule, StocksModule, ExchangeModule, SocketModule],
    controllers: [],
    providers: [],
})
export class AppModule {}

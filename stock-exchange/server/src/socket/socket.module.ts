import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.service';
import { BrokersModule } from '../brokers/brokers.module';
import { StocksModule } from '../stocks/stocks.module';
import { ExchangeModule } from '../exchange/exchange.module';

@Module({
    imports: [BrokersModule, StocksModule, ExchangeModule],
    controllers: [],
    providers: [SocketGateway],
})
export class SocketModule {}

import { Module } from '@nestjs/common';
import { BrokersModule } from './brokers/brokers.module';
import { SocketModule } from './socket/socket.module';

@Module({
    imports: [BrokersModule, BrokersModule, SocketModule],
    controllers: [],
    providers: [],
})
export class AppModule {}

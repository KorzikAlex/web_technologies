import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.service';

@Module({
    imports: [],
    controllers: [],
    providers: [SocketGateway],
})
export class SocketModule {}

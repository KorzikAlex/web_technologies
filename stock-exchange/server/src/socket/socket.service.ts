import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { BrokersService } from '../brokers/brokers.service';

@Injectable()
@WebSocketGateway({ cors: true, path: '/ws' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly brokersService: BrokersService) {}

    handleConnection(client: Socket) {
        // Даем первоначальные данные брокеру (если нужно)
        client.emit('welcome', { id: client.id });
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected ${client.id}`);
    }

    // Удобный метод рассылки всем
    broadcast(event: string, payload: any) {
        this.server.emit(event, payload);
    }

    // Послать одному клиенту
    sendTo(clientId: string, event: string, payload: any) {
        const client = this.server.sockets.sockets.get(clientId);
        client?.emit(event, payload);
    }
}

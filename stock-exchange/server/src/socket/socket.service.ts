import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { BrokersService } from '../brokers/brokers.service';
import { StocksService } from '../stocks/stocks.service';
import { Stock } from 'src/interfaces/Stock';
import { ExchangeService } from 'src/exchange/exchange.service';
import { ExchangeSettings } from 'src/interfaces/ExchangeSettings';

@Injectable()
@WebSocketGateway({ cors: true, path: '/ws' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly brokersService: BrokersService,
        private readonly stocksService: StocksService,
        private readonly exchangeService: ExchangeService,
    ) {}

    afterInit() {
        console.log('WebSocket Gateway initialized');

        // Подписываемся на обновления цен
        this.stocksService.setPriceUpdateCallback((stock: Stock) => {
            this.broadcast('stockPriceUpdate', stock);
        });

        // Подписываемся на обновления торгов
        this.exchangeService.setTradingUpdateCallback(
            (settings: ExchangeSettings, prices: Record<string, number>) => {
                this.broadcast('tradingUpdate', { settings, prices });
            },
        );
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        // Отправляем текущие акции и состояние биржи новому клиенту
        client.emit('welcome', {
            id: client.id,
            stocks: this.stocksService.getStocks(),
            tradingState: this.exchangeService.getCurrentTradingState(),
        });
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

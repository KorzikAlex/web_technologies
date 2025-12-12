import { io, Socket } from 'socket.io-client';
import type { AppDispatch } from '@/store';
import { updateTradingState } from '@/store/slices/exchangeSlice';

class WebSocketService {
    private socket: Socket | null = null;
    private dispatch: AppDispatch | null = null;

    connect(dispatch: AppDispatch) {
        this.dispatch = dispatch;

        this.socket = io('http://localhost:3000', {
            path: '/ws',
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        this.socket.on('welcome', (data) => {
            console.log('Welcome message:', data);
            if (data.tradingState) {
                this.dispatch?.(updateTradingState({
                    settings: data.tradingState.settings,
                    prices: data.tradingState.prices,
                }));
            }
        });

        this.socket.on('tradingUpdate', (data) => {
            console.log('Trading update:', data);
            if (this.dispatch) {
                this.dispatch(updateTradingState({
                    settings: data.settings,
                    prices: data.prices,
                }));
            }
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const wsService = new WebSocketService();

import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { Broker } from 'src/interfaces/Broker';

@Injectable()
export class BrokersService {
    private readonly BROKERS_PATH = path.join('data', 'brokers.json');

    getBrokers(): Broker[] {
        try {
            const data = fs.readFileSync(this.BROKERS_PATH, 'utf-8').trim();
            return JSON.parse(data) as Broker[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    getBroker(params: Partial<Broker>): Broker | undefined {
        const brokers = this.getBrokers();
        const broker = brokers.find((b: Broker): boolean => {
            return b.id === params.id || b.name === params.name;
        });
        return broker;
    }

    addBroker(broker: Broker): Broker {
        const brokers = this.getBrokers();
        const id = broker.id ?? this.generateBrokerId();
        const newBroker: Broker = {
            ...broker,
            id,
            stocks: broker.stocks ?? {},
        };
        brokers.push(newBroker);
        this.updateBrokers(brokers);
        return newBroker;
    }

    deleteBroker(brokerId: number): void {
        const brokers = this.getBrokers().filter((b: Broker): boolean => b.id !== brokerId);
        this.updateBrokers(brokers);
    }

    updateBrokers(brokers: Broker[]): void {
        fs.writeFileSync(this.BROKERS_PATH, JSON.stringify(brokers, null, 4), 'utf-8');
    }

    updateBroker(brokerId: number, updatedBroker: Partial<Broker>): void {
        const brokers = this.getBrokers().map((b: Broker): Broker => {
            if (b.id === brokerId) {
                return { ...b, ...updatedBroker };
            }
            return b;
        });
        this.updateBrokers(brokers);
    }

    generateBrokerId(): number {
        const brokers = this.getBrokers();
        if (brokers.length === 0) {
            return 1;
        }
        return (brokers[brokers.length - 1]?.id ?? 0) + 1;
    }

    buyStock(
        brokerId: number,
        symbol: string,
        quantity: number,
        price: number,
    ): { success: boolean; message?: string; broker?: Broker } {
        const brokers = this.getBrokers();
        const broker = brokers.find((b) => b.id === brokerId);

        if (!broker) {
            return { success: false, message: 'Broker not found' };
        }

        const totalCost = quantity * price;
        if (broker.balance < totalCost) {
            return { success: false, message: 'Insufficient funds' };
        }

        // Обновляем баланс
        broker.balance -= totalCost;

        // Обновляем портфель
        if (!broker.stocks) {
            broker.stocks = {};
        }
        if (!broker.stocksPurchasePrice) {
            broker.stocksPurchasePrice = {};
        }

        // Рассчитываем среднюю цену покупки
        if (broker.stocks[symbol]) {
            const oldQuantity = broker.stocks[symbol];
            const oldPrice = broker.stocksPurchasePrice[symbol] || price;
            const newQuantity = oldQuantity + quantity;
            // Средневзвешенная цена
            broker.stocksPurchasePrice[symbol] = (oldPrice * oldQuantity + price * quantity) / newQuantity;
            broker.stocks[symbol] = newQuantity;
        } else {
            broker.stocks[symbol] = quantity;
            broker.stocksPurchasePrice[symbol] = price;
        }

        this.updateBrokers(brokers);
        return { success: true, broker };
    }

    sellStock(
        brokerId: number,
        symbol: string,
        quantity: number,
        price: number,
    ): { success: boolean; message?: string; broker?: Broker } {
        const brokers = this.getBrokers();
        const broker = brokers.find((b) => b.id === brokerId);

        if (!broker) {
            return { success: false, message: 'Broker not found' };
        }

        if (!broker.stocks || !broker.stocks[symbol]) {
            return { success: false, message: 'Stock not found in portfolio' };
        }

        if (broker.stocks[symbol] < quantity) {
            return {
                success: false,
                message: 'Insufficient stock quantity',
            };
        }

        // Обновляем портфель
        broker.stocks[symbol] -= quantity;
        if (broker.stocks[symbol] === 0) {
            delete broker.stocks[symbol];
        }

        // Обновляем баланс
        broker.balance += quantity * price;

        this.updateBrokers(brokers);
        return { success: true, broker };
    }
}

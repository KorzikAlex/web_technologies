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

    getBroker(params: Partial<Broker>): string {
        const brokers = this.getBrokers();
        const broker = brokers.find((b: Broker): boolean => {
            return b.id === params.id || b.name === params.name;
        });
        return broker ? JSON.stringify(broker) : 'Broker not found';
    }

    addBroker(broker: Broker): void {
        const brokers = this.getBrokers();
        const newBroker = {
            ...broker,
            stocks: broker.stocks ?? {},
        };
        brokers.push(newBroker);
        this.updateBrokers(brokers);
    }

    deleteBroker(brokerId: number): void {
        const brokers = this.getBrokers().filter(
            (b: Broker): boolean => b.id !== brokerId,
        );
        this.updateBrokers(brokers);
    }

    updateBrokers(brokers: Broker[]): void {
        fs.writeFileSync(
            this.BROKERS_PATH,
            JSON.stringify(brokers, null, 4),
            'utf-8',
        );
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
}

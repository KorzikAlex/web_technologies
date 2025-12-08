import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { Broker } from 'src/interfaces/Broker';

const BROKERS_PATH = path.join('data', 'brokers.json');

@Injectable()
export class BrokersService {
    getBrokers(): Broker[] {
        try {
            const data = fs.readFileSync(BROKERS_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    getBroker(params: Partial<Broker>): string {
        const data = fs.readFileSync(BROKERS_PATH, 'utf-8');
        const brokers = JSON.parse(data);
        const broker = brokers.filter(
            (params.name) => {
                if (broker.name === params.name) {
                    return true;
                }
            }
        )[0]
        return JSON.stringify(broker);
    }

}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { BrokersService } from './brokers.service';

@Controller('brokers')
export class BrokersController {
    constructor(private readonly brokersService: BrokersService) { }

    @Get()
    getBrokers() {
        return this.brokersService.getBrokers();
    }

    @Get('broker')
    getBroker(params: { name: string }) {
        return this.brokersService.getBroker(params);
    }

    @Post('broker')
    addBroker(@Body() broker: any): void {
        this.brokersService.addBroker({ id: this.brokersService.generateBrokerId(), ...broker, stocks: {} });
    }

}

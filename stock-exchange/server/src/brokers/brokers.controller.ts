import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { type Broker } from 'src/interfaces/Broker';

@Controller('brokers')
export class BrokersController {
    constructor(private readonly brokersService: BrokersService) {}

    @Get()
    getBrokers() {
        return this.brokersService.getBrokers();
    }

    @Get('id/:id')
    getBrokerById(@Param('id') id: string) {
        const numericId = parseInt(id, 10);
        if (Number.isNaN(numericId)) {
            return { message: 'Invalid id parameter' };
        }
        const broker = this.brokersService.getBroker({ id: numericId });
        if (!broker) {
            return { message: 'Broker not found' };
        }
        return broker;
    }

    @Get('name/:name')
    getBrokerByName(@Param('name') name: string) {
        const broker = this.brokersService.getBroker({ name });
        if (!broker) {
            return { message: 'Broker not found', found: false };
        }
        return { ...broker, found: true };
    }

    @Post('broker')
    addBroker(@Body() broker: Broker) {
        const created = this.brokersService.addBroker({
            ...broker,
            id: broker.id ?? this.brokersService.generateBrokerId(),
        });
        return {
            message: 'Broker added successfully',
            broker: created,
        };
    }

    @Delete('id/:id')
    deleteBrokerById(@Param('id') id: string) {
        const numericId = parseInt(id, 10);
        if (Number.isNaN(numericId)) {
            return { message: 'Invalid id parameter' };
        }
        this.brokersService.deleteBroker(numericId);
        return {
            message: 'Broker deleted successfully',
        };
    }

    @Patch('id/:id')
    updateBrokerById(@Param('id') id: string, @Body() updatedBroker: Partial<Broker>) {
        const numericId = parseInt(id, 10);
        if (Number.isNaN(numericId)) {
            return { message: 'Invalid id parameter' };
        }
        this.brokersService.updateBroker(numericId, updatedBroker);
        return {
            message: 'Broker partially updated successfully',
        };
    }

    @Post(':id/buy')
    buyStock(
        @Param('id') id: string,
        @Body() body: { symbol: string; quantity: number; price: number },
    ) {
        const numericId = parseInt(id, 10);
        if (Number.isNaN(numericId)) {
            return { message: 'Invalid id parameter' };
        }

        const result = this.brokersService.buyStock(
            numericId,
            body.symbol,
            body.quantity,
            body.price,
        );

        if (!result.success) {
            return { message: result.message };
        }

        return {
            message: 'Stock purchased successfully',
            broker: result.broker,
        };
    }

    @Post(':id/sell')
    sellStock(
        @Param('id') id: string,
        @Body() body: { symbol: string; quantity: number; price: number },
    ) {
        const numericId = parseInt(id, 10);
        if (Number.isNaN(numericId)) {
            return { message: 'Invalid id parameter' };
        }

        const result = this.brokersService.sellStock(
            numericId,
            body.symbol,
            body.quantity,
            body.price,
        );

        if (!result.success) {
            return { message: result.message };
        }

        return {
            message: 'Stock sold successfully',
            broker: result.broker,
        };
    }
}

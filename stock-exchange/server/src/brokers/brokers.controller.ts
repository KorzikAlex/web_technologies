import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
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
        return this.brokersService.getBroker({ id: numericId });
    }

    @Post('broker')
    addBroker(@Body() broker: Broker) {
        this.brokersService.addBroker({
            ...broker,
            id: broker.id ?? this.brokersService.generateBrokerId(),
        });
        return {
            message: 'Broker added successfully',
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
    updateBrokerById(
        @Param('id') id: string,
        @Body() updatedBroker: Partial<Broker>,
    ) {
        const numericId = parseInt(id, 10);
        if (Number.isNaN(numericId)) {
            return { message: 'Invalid id parameter' };
        }
        this.brokersService.updateBroker(numericId, updatedBroker);
        return {
            message: 'Broker partially updated successfully',
        };
    }
}

import ExchangeSettingsCard from '@/components/cards/ExchangeSettingsCard';
import ActiveStocksCard from '@/components/cards/ActiveStocksCard';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStocks } from '@/store/slices/stocksSlice';

export default function ExchangePage() {
    const dispatch = useAppDispatch();
    const stocks = useAppSelector((state) => state.stocks.stocks);
    const { currentDate, prices } = useAppSelector((state) => state.exchange);

    useEffect(() => {
        dispatch(fetchStocks());
    }, [dispatch]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ExchangeSettingsCard />
            <ActiveStocksCard
                stocks={stocks}
                prices={prices}
                currentDate={currentDate}
            />
        </Box>
    );
}

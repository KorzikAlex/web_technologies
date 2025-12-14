import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Chip,
    Typography,
} from '@mui/material';
import type { Company } from '@/interfaces/Company';

type ActiveStocksCardProps = {
    stocks?: Company[];
    prices?: Record<string, number>;
    currentDate?: string;
};

export default function ActiveStocksCard({
    stocks,
    prices,
    currentDate,
}: ActiveStocksCardProps) {
    const enabledStocks = stocks?.filter((stock) => stock.enabled) || [];

    // Форматируем дату из YYYY-MM-DD в DD/MM/YYYY
    const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <Card
            variant="outlined"
            sx={(theme) => ({
                backgroundColor:
                    theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.02)'
                        : theme.palette.background.paper,
                borderColor: theme.palette.divider,
            })}
        >
            <CardHeader
                title="Активные акции в торгах"
                subheader={
                    currentDate
                        ? `Текущая дата торгов: ${formatDate(currentDate)}`
                        : 'Торги не начаты'
                }
            />
            <CardContent>
                {enabledStocks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Нет активных акций в торгах. Включите акции на странице
                        "Акции".
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {enabledStocks.map((stock) => {
                            const price = prices?.[stock.symbol];
                            return (
                                <Chip
                                    key={stock.symbol}
                                    label={
                                        price !== undefined
                                            ? `${stock.symbol}: $${price.toFixed(2)}`
                                            : stock.symbol
                                    }
                                    color="primary"
                                    variant="outlined"
                                />
                            );
                        })}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

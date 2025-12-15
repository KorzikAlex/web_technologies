import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchExchangeSettings,
    updateExchangeSettings,
    startTrading,
    stopTrading,
} from '@/store/slices/exchangeSlice';
import dayjs, { type Dayjs } from 'dayjs';

type TimeUnit = 'seconds' | 'milliseconds';

export default function ExchangeSettingsCard() {
    const dispatch = useAppDispatch();
    const { settings, loading } = useAppSelector((state) => state.exchange);
    const stocks = useAppSelector((state) => state.stocks.stocks);

    // Проверяем, есть ли включенные акции
    const hasEnabledStocks = useMemo(() =>
        stocks.some((stock) => stock.enabled),
        [stocks]
    );

    // Вычисляем начальные значения из settings
    const derivedStartDate = useMemo(() =>
        settings.startDate ? dayjs(settings.startDate) : null,
        [settings.startDate]
    );

    const { derivedTickValue, derivedTimeUnit } = useMemo(() => {
        const seconds = settings.tickSeconds;
        if (seconds >= 1) {
            return { derivedTickValue: seconds, derivedTimeUnit: 'seconds' as TimeUnit };
        } else {
            return { derivedTickValue: seconds * 1000, derivedTimeUnit: 'milliseconds' as TimeUnit };
        }
    }, [settings.tickSeconds]);

    const [startDate, setStartDate] = useState<Dayjs | null>(derivedStartDate);
    const [tickValue, setTickValue] = useState<number>(derivedTickValue);
    const [timeUnit, setTimeUnit] = useState<TimeUnit>(derivedTimeUnit);

    useEffect(() => {
        dispatch(fetchExchangeSettings());
    }, [dispatch]);

    // Синхронизируем локальное состояние с глобальным при изменении settings
    useEffect(() => {
        setStartDate(derivedStartDate);
    }, [derivedStartDate]);

    useEffect(() => {
        setTickValue(derivedTickValue);
        setTimeUnit(derivedTimeUnit);
    }, [derivedTickValue, derivedTimeUnit]);

    const handleSaveSettings = async () => {
        if (!startDate) return;

        const tickSeconds = timeUnit === 'seconds' ? tickValue : tickValue / 1000;

        await dispatch(
            updateExchangeSettings({
                startDate: startDate.format('YYYY-MM-DD'),
                tickSeconds,
            }),
        );
    };

    const handleStartTrading = async () => {
        if (!startDate) return;

        const tickSeconds = timeUnit === 'seconds' ? tickValue : tickValue / 1000;

        // Сначала сохраняем настройки
        await dispatch(
            updateExchangeSettings({
                startDate: startDate.format('YYYY-MM-DD'),
                tickSeconds,
            }),
        );

        // Затем запускаем торги
        await dispatch(startTrading());
    };

    const handleStopTrading = async () => {
        await dispatch(stopTrading());
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
            <CardHeader title="Настройки биржи" />
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        width: '100%',
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <DatePicker
                            label="Дата начала торгов"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            format="DD/MM/YYYY"
                            slotProps={{ textField: { fullWidth: true } }}
                            disabled={settings.running}
                        />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', gap: 1 }}>
                        <TextField
                            label="Скорость смены дат"
                            type="number"
                            variant="outlined"
                            fullWidth
                            value={tickValue}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0) {
                                    setTickValue(value);
                                }
                            }}
                            inputProps={{ min: timeUnit === 'seconds' ? 1 : 100 }}
                            disabled={settings.running}
                        />
                        <FormControl sx={{ minWidth: 120 }} disabled={settings.running}>
                            <InputLabel>Единица</InputLabel>
                            <Select
                                value={timeUnit}
                                label="Единица"
                                onChange={(e) => {
                                    const newUnit = e.target.value as TimeUnit;
                                    // Конвертируем значение при смене единицы
                                    if (newUnit === 'milliseconds' && timeUnit === 'seconds') {
                                        setTickValue(tickValue * 1000);
                                    } else if (newUnit === 'seconds' && timeUnit === 'milliseconds') {
                                        setTickValue(Math.max(1, tickValue / 1000));
                                    }
                                    setTimeUnit(newUnit);
                                }}
                            >
                                <MenuItem value="seconds">Сек</MenuItem>
                                <MenuItem value="milliseconds">Мс</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'flex-end',
                        gap: 1,
                        width: '100%',
                    }}
                >
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleSaveSettings}
                        disabled={loading || settings.running}
                        fullWidth
                        sx={{ flexGrow: { xs: 1, sm: 0 } }}
                    >
                        Сохранить настройки
                    </Button>
                    {!settings.running ? (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleStartTrading}
                            disabled={loading || !startDate || !hasEnabledStocks}
                            fullWidth
                            sx={{ flexGrow: { xs: 1, sm: 0 } }}
                        >
                            Начать торги
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleStopTrading}
                            disabled={loading}
                            fullWidth
                            sx={{ flexGrow: { xs: 1, sm: 0 } }}
                        >
                            Остановить торги
                        </Button>
                    )}
                </Box>
            </CardActions>
        </Card>
    );
}

import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function ExchangeSettingsCard() {
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
                        gap: 2,
                        width: '100%',
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <DatePicker
                            label="Дата начала торгов"
                            value={null}
                            onChange={() => {}}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <TextField
                            label="Скорость смены дат в секундах"
                            type="number"
                            variant="outlined"
                            fullWidth
                        />
                    </Box>
                </Box>
            </CardContent>
            <CardActions>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button variant="text" color="primary">
                        Начать торги
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
}

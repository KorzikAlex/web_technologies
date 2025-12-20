import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

type SelectDateDialogProps = {
    open: boolean;
    companyName?: string;
    onClose: () => void;
    onApply: (startDate: Dayjs | null, endDate: Dayjs | null) => void;
};

export default function SelectDateDialog({
    open,
    companyName,
    onClose,
    onApply,
}: SelectDateDialogProps) {
    const currentYear = dayjs().year();
    const [startDate, setStartDate] = useState<Dayjs | null>(
        dayjs().year(currentYear - 1).startOf('year'),
    );
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

    const handleApply = () => {
        onApply(startDate, endDate);
        onClose();
    };

    const handleClose = () => {
        // Reset to defaults
        setStartDate(dayjs().year(currentYear - 1).startOf('year'));
        setEndDate(dayjs());
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                variant: 'outlined',
                elevation: 0,
            }}
        >
            <DialogTitle>Выбор периода для просмотра данных</DialogTitle>
            <DialogContent>
                {companyName && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Компания: <strong>{companyName}</strong>
                    </Typography>
                )}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 1,
                    }}
                >
                    <DatePicker
                        label="Дата начала периода"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                helperText: 'Начало периода для анализа',
                            },
                        }}
                    />
                    <DatePicker
                        label="Дата окончания периода"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                helperText: 'Конец периода для анализа',
                            },
                        }}
                        minDate={startDate || undefined}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button
                    onClick={handleApply}
                    variant="contained"
                    color="primary"
                    disabled={!startDate || !endDate}
                >
                    Применить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

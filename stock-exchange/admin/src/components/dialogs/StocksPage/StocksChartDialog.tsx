import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { StockHistoryEntry } from '@/interfaces/Stock';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

type StocksChartDialogProps = {
    open: boolean;
    companyName: string;
    symbol: string;
    history: StockHistoryEntry[];
    onClose: () => void;
};

export default function StocksChartDialog({
    open,
    companyName,
    history,
    onClose,
}: StocksChartDialogProps) {
    // Sort history by date (oldest first for chart)
    const sortedHistory = [...history].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const chartData = {
        labels: sortedHistory.map((entry) => entry.date),
        datasets: [
            {
                label: 'Цена открытия ($)',
                data: sortedHistory.map((entry) => entry.open),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: (value: string | number) => {
                        return '$' + Number(value).toFixed(2);
                    },
                },
            },
        },
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                variant: 'outlined',
                elevation: 0,
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                График изменения курса: {companyName}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ height: 400, width: '100%' }}>
                    {history.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            Нет данных за выбранный период
                        </Box>
                    ) : (
                        <Line data={chartData} options={chartOptions} />
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

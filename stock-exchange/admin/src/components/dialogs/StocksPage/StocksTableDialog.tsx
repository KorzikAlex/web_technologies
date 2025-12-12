import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { StockHistoryEntry } from '@/interfaces/Stock';

type StocksTableDialogProps = {
    open: boolean;
    companyName: string;
    symbol: string;
    history: StockHistoryEntry[];
    onClose: () => void;
};

export default function StocksTableDialog({
    open,
    companyName,
    history,
    onClose,
}: StocksTableDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                variant: 'outlined',
                elevation: 0,
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Исторические данные: {companyName}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Дата</strong></TableCell>
                                <TableCell align="right"><strong>Цена открытия ($)</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        Нет данных за выбранный период
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((entry, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{entry.date}</TableCell>
                                        <TableCell align="right">${entry.open.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    );
}

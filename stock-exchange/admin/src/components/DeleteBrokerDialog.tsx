import type { Broker } from '@/interfaces/Broker';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

type DeleteBrokerDialogProps = {
    open: boolean;
    broker: Broker | null;
    onClose: () => void;
    onDelete: () => void;
};

export default function DeleteBrokerDialog({
    open,
    onClose,
    onDelete,
}: DeleteBrokerDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Удалить брокера</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Вы уверены, что хотите удалить этого брокера? Это действие
                    необратимо.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={onDelete} variant="contained" color="error">
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

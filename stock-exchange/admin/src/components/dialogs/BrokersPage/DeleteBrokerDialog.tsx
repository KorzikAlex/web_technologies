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
    broker: Broker;
    onClose: () => void;
    onDelete: (broker: Broker) => void;
};

export default function DeleteBrokerDialog({
    open,
    broker,
    onClose,
    onDelete,
}: DeleteBrokerDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                variant: 'outlined',
                elevation: 0,
            }}
        >
            <DialogTitle>Удалить брокера</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Вы уверены, что хотите удалить этого брокера? Это действие
                    необратимо.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    onClick={() => onDelete(broker)}
                    color="error"
                    variant="contained"
                >
                    Удалить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

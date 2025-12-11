import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';

type AddBrokerDialogProps = {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string, balance: number) => void;
};

export default function AddBrokerDialog({
    open,
    onClose,
    onCreate,
}: AddBrokerDialogProps) {
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
            <DialogTitle>Новый брокер</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Имя брокера"
                    type="text"
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                />
                <TextField
                    margin="dense"
                    label="Баланс"
                    type="number"
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    onClick={() => onCreate}
                    variant="contained"
                    color="primary"
                >
                    Создать
                </Button>
            </DialogActions>
        </Dialog>
    );
}

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import { useState } from 'react';

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
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');

    const handleCreate = () => {
        const parsed = parseFloat(balance || '0');
        if (!name) return;
        onCreate(name, parsed);
        setName('');
        setBalance('');
        onClose();
    };

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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Баланс"
                    type="number"
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    inputProps={{ min: 0 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    color="primary"
                    disabled={!name || !balance || parseFloat(balance) < 0}
                >
                    Создать
                </Button>
            </DialogActions>
        </Dialog>
    );
}

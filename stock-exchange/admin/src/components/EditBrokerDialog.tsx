import {
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    DialogActions,
    Button,
} from '@mui/material';
import { useState } from 'react';
import { type Broker } from '@/interfaces/Broker';

type EditBrokerDialogProps = {
    open: boolean;
    broker: Broker | null;
    onClose: () => void;
    onSave: (broker: Broker) => void;
};

export default function EditBrokerDialog({
    open,
    broker,
    onClose,
    onSave,
}: EditBrokerDialogProps) {
    const [name, setName] = useState(broker?.name || '');
    const [balance, setBalance] = useState(broker?.balance.toString() || '');

    const handleSave = () => {
        if (broker && name && balance) {
            onSave({
                ...broker,
                name,
                balance: parseFloat(balance),
            });
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            key={broker?.id}
        >
            <DialogTitle>Редактировать брокера</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Имя брокера"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mt: 2 }}
                />
                <TextField
                    margin="dense"
                    label="Баланс"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

import { Fab } from '@mui/material';
import BrokersTable from '@/components/tables/BrokersTable';
import AddBrokerDialog from '@/components/dialogs/BrokersPage/AddBrokerDialog';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import type { Broker } from '@/interfaces/Broker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchBrokers,
    createBroker as createBrokerAction,
    updateBroker as updateBrokerAction,
    deleteBroker as deleteBrokerAction,
} from '@/store/slices/brokersSlice';

export default function BrokersPage() {
    const dispatch = useAppDispatch();
    const brokers = useAppSelector((state) => state.brokers.brokers);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchBrokers());
    }, [dispatch]);

    const handleAddBroker = () => {
        setAddDialogOpen((prev) => !prev);
    };

    const handleCreateBroker = (name: string, balance: number) => {
        dispatch(createBrokerAction({ name, balance }));
    };

    const handleUpdateBroker = (broker: Broker) => {
        dispatch(updateBrokerAction(broker));
    };

    const handleDeleteBroker = (broker: Broker) => {
        if (broker.id) {
            dispatch(deleteBrokerAction(broker.id));
        }
    };

    return (
        <>
            <BrokersTable brokers={brokers} onUpdate={handleUpdateBroker} onDelete={handleDeleteBroker} />
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                }}
                onClick={handleAddBroker}
            >
                <AddIcon />
            </Fab>

            <AddBrokerDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onCreate={handleCreateBroker}
            />
        </>
    );
}

import { Fab } from '@mui/material';
import BrokersTable from '@/components/tables/BrokersTable';
import AddBrokerDialog from '@/components/dialogs/BrokersPage/AddBrokerDialog';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';

export default function BrokersPage() {
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const handleAddBroker = () => {
        setAddDialogOpen((prev) => !prev);
        console.log('Добавить брокера');
        // TODO: Реализовать добавление
    };

    return (
        <>
            <BrokersTable
                brokers={[
                    {
                        id: 1,
                        name: 'Брокер 1',
                        balance: 10000,
                    },
                    {
                        id: 2,
                        name: 'Брокер 2',
                        balance: 25000,
                    },
                ]}
            />
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
                onClose={() => setAddDialogOpen((prev) => !prev)}
                onCreate={(name: string, balance: number) => {
                    console.log('Создать брокера:', { name, balance });
                }}
            />
        </>
    );
}

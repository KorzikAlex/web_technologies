import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { type Broker } from '@/interfaces/Broker';
import { useState } from 'react';
import EditBrokerDialog from '@/components/dialogs/BrokersPage/EditBrokerDialog';
import DeleteBrokerDialog from '@/components/dialogs/BrokersPage/DeleteBrokerDialog';
import BaseTable from './BaseTable';

type BrokersTableProps = {
    brokers?: Broker[];
};

export default function BrokersTable({ brokers }: BrokersTableProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleEditBroker = (broker: Broker) => {
        setSelectedBroker(broker);
        setEditDialogOpen((prev) => !prev);
    };

    const handleDeleteBroker = (broker: Broker) => {
        console.log('Удалить брокера:', broker);
        setDeleteDialogOpen((prev) => !prev);
        setSelectedBroker(broker);
        // TODO: Реализовать удаление
    };

    const handleSaveBroker = (updatedBroker: Broker) => {
        console.log('Сохранить брокера:', updatedBroker);
        // TODO: Реализовать сохранение
    };

    const columns = [
        {
            key: 'name',
            label: 'Имя брокера',
            render: (broker: Broker) => broker.name,
        },
        {
            key: 'balance',
            label: 'Баланс',
            render: (broker: Broker) => broker.balance,
        },
    ];

    const actions = [
        {
            label: 'Редактировать',
            icon: <EditIcon />,
            color: 'primary' as const,
            onClick: handleEditBroker,
        },
        {
            label: 'Удалить',
            icon: <DeleteIcon />,
            color: 'error' as const,
            onClick: handleDeleteBroker,
        },
    ];

    return (
        <>
            <BaseTable data={brokers} columns={columns} actions={actions} />

            <EditBrokerDialog
                open={editDialogOpen}
                broker={selectedBroker}
                onClose={() => setEditDialogOpen((prev) => !prev)}
                onSave={handleSaveBroker}
            />

            <DeleteBrokerDialog
                open={deleteDialogOpen}
                broker={selectedBroker!}
                onClose={() => setDeleteDialogOpen((prev) => !prev)}
                onDelete={handleDeleteBroker}
            />
        </>
    );
}

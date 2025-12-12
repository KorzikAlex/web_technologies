import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { type Broker } from '@/interfaces/Broker';
import { useState, useMemo } from 'react';
import EditBrokerDialog from '@/components/dialogs/BrokersPage/EditBrokerDialog';
import DeleteBrokerDialog from '@/components/dialogs/BrokersPage/DeleteBrokerDialog';
import BaseTable from './BaseTable';

type SortField = 'name' | 'balance';
type SortOrder = 'asc' | 'desc';

type BrokersTableProps = {
    brokers?: Broker[];
    onUpdate?: (broker: Broker) => void;
    onDelete?: (broker: Broker) => void;
};

export default function BrokersTable({ brokers, onUpdate, onDelete }: BrokersTableProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const handleEditBroker = (broker: Broker) => {
        setSelectedBroker(broker);
        setEditDialogOpen(true);
    };

    const handleDeleteBroker = (broker: Broker) => {
        setSelectedBroker(broker);
        setDeleteDialogOpen(true);
    };

    const handleSaveBroker = (updatedBroker: Broker) => {
        if (onUpdate) onUpdate(updatedBroker);
        setEditDialogOpen(false);
    };

    const confirmDeleteBroker = (broker: Broker) => {
        if (onDelete) onDelete(broker);
        setDeleteDialogOpen(false);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedBrokers = useMemo(() => {
        if (!brokers) return [];

        return [...brokers].sort((a, b) => {
            let comparison = 0;

            if (sortField === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortField === 'balance') {
                comparison = a.balance - b.balance;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [brokers, sortField, sortOrder]);

    const columns = [
        {
            key: 'name',
            label: 'Имя брокера',
            render: (broker: Broker) => broker.name,
            sortable: true,
            onSort: () => handleSort('name'),
            sortActive: sortField === 'name',
            sortOrder: sortField === 'name' ? sortOrder : undefined,
        },
        {
            key: 'balance',
            label: 'Баланс',
            render: (broker: Broker) => broker.balance,
            sortable: true,
            onSort: () => handleSort('balance'),
            sortActive: sortField === 'balance',
            sortOrder: sortField === 'balance' ? sortOrder : undefined,
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
            <BaseTable data={sortedBrokers} columns={columns} actions={actions} />

            <EditBrokerDialog
                open={editDialogOpen}
                broker={selectedBroker}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveBroker}
            />

            {selectedBroker && (
                <DeleteBrokerDialog
                    open={deleteDialogOpen}
                    broker={selectedBroker}
                    onClose={() => setDeleteDialogOpen(false)}
                    onDelete={confirmDeleteBroker}
                />
            )}
        </>
    );
}

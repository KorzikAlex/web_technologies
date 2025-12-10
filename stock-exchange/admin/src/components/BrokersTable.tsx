import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type Broker } from '@/interfaces/Broker';
import { useState } from 'react';
import EditBrokerDialog from './EditBrokerDialog';
import DeleteBrokerDialog from './DeleteBrokerDialog';

type BrokersTableProps = {
    brokers?: Broker[];
};

type ButtonColor =
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';

export default function BrokersTable({ brokers }: BrokersTableProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const tableHeadArray: string[] = ['Имя брокера', 'Баланс', 'Действия'];

    const handleEditBroker = (broker: Broker) => {
        setSelectedBroker(broker);
        setEditDialogOpen(true);
    };

    const handleDeleteBroker = (broker: Broker) => {
        console.log('Удалить брокера:', broker);
        // TODO: Реализовать удаление
    };

    const handleSaveBroker = (updatedBroker: Broker) => {
        console.log('Сохранить брокера:', updatedBroker);
        // TODO: Реализовать сохранение
    };

    const actionsArray = [
        {
            label: 'Редактировать',
            icon: <EditIcon />,
            color: 'primary' as ButtonColor,
            onClick: handleEditBroker,
        },
        {
            label: 'Удалить',
            icon: <DeleteIcon />,
            color: 'error' as ButtonColor,
            onClick: handleDeleteBroker,
        },
    ];

    const TableHeadRow = (
        <TableRow>
            {tableHeadArray?.map((name) => (
                <TableCell key={name}>{name}</TableCell>
            ))}
        </TableRow>
    );

    const BrokerActions = (broker: Broker) => (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
            }}
        >
            {actionsArray?.map((action) => (
                <Button
                    key={action.label}
                    size="small"
                    variant="outlined"
                    color={action.color}
                    startIcon={action.icon}
                    onClick={() => action.onClick(broker)}
                >
                    {action.label}
                </Button>
            ))}
        </Box>
    );

    const BrokersList = (
        <>
            {brokers?.map((broker) => (
                <TableRow key={broker.id}>
                    <TableCell>{broker.name}</TableCell>
                    <TableCell>{broker.balance}</TableCell>
                    <TableCell>{BrokerActions(broker)}</TableCell>
                </TableRow>
            ))}
        </>
    );

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>{TableHeadRow}</TableHead>
                    <TableBody>{BrokersList}</TableBody>
                </Table>
            </TableContainer>

            <EditBrokerDialog
                open={editDialogOpen}
                broker={selectedBroker}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveBroker}
            />
            <DeleteBrokerDialog
                open={deleteDialogOpen}
                broker={selectedBroker}
                onClose={() => setDeleteDialogOpen(false)}
                onDelete={handleDeleteBroker}
            />
        </>
    );
}

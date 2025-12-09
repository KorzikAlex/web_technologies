import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type Broker } from "@/interfaces/Broker";

type BrokersTableProps = {
    brokers?: Broker[]
}

type ButtonColor = "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";

export default function BrokersTable({ brokers }: BrokersTableProps) {
    const tableHeadArray: string[] = [
        "Имя брокера",
        "Баланс",
        "Действия",
    ];

    const actionsArray = [
        {
            label: "Редактировать",
            icon: <EditIcon />,
            color: "primary" as ButtonColor,
            onClick: (broker: Broker) => {
                console.log("Редактировать брокера:", broker);
            }
        },
        {
            label: "Удалить",
            icon: <DeleteIcon />,
            color: "error" as ButtonColor,
            onClick: (broker: Broker) => {
                console.log("Удалить брокера:", broker);
            }
        }
    ];

    const TableHeadRow = (
        <TableRow>
            {
                tableHeadArray?.map(
                    (name) => (
                        <TableCell key={name}>{name}</TableCell>
                    )
                )
            }
        </TableRow>
    )

    const BrokerActions = (
        <Box sx={
            {
                display: 'flex',
                gap: 1
            }
        }>
            {
                actionsArray?.map(
                    (action) => (
                        <Button
                            key={action.label}
                            size="small"
                            variant="outlined"
                            color={action.color}
                            startIcon={action.icon}
                            onClick={() => action.onClick}
                        >
                            {action.label}
                        </Button>
                    )
                )
            }
        </Box>
    )

    const BrokersList = (
        <>
            {
                brokers?.map(
                    (broker) => (
                        <TableRow key={broker.id}>
                            <TableCell>{broker.name}</TableCell>
                            <TableCell>{broker.balance}</TableCell>
                            <TableCell>
                                {BrokerActions}
                            </TableCell>
                        </TableRow>
                    )
                )
            }
        </>
    )

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    {TableHeadRow}
                </TableHead>
                <TableBody>
                    {BrokersList}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
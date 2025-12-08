import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import { type Broker } from "../../interfaces/Broker";

type BrokersTableProps = {
    brokers?: Broker[],
    tableHeadArray?: string[],
    actionsArray?: ButtonAction[],
}

export type ButtonAction = {
    icon?: React.ReactNode,
    label: string,
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning",
    onClick: (broker: Broker) => void,
}

export default function BrokersTable(
    {
        brokers,
        tableHeadArray,
        actionsArray,
    }: BrokersTableProps
) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {
                            tableHeadArray?.map(
                                (name) => (
                                    <TableCell key={name}>{name}</TableCell>
                                )
                            )
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        brokers?.map(
                            (broker) => (
                                <TableRow key={broker.id}>
                                    <TableCell>{broker.name}</TableCell>
                                    <TableCell>{broker.balance}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {
                                                actionsArray?.map(
                                                    (action) => (
                                                        <Button
                                                            key={action.label}
                                                            size="small"
                                                            variant="outlined"
                                                            color={action.color || "primary"}
                                                            startIcon={action.icon}
                                                            onClick={() => action.onClick(broker)}
                                                        >
                                                            {action.label}
                                                        </Button>
                                                    )
                                                )
                                            }
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
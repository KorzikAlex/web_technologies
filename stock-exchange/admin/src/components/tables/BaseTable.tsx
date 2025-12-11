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

type Column<T> = {
    key: string;
    label: string;
    render: (item: T) => React.ReactNode;
};

type Action<T> = {
    label: string;
    icon?: React.ReactNode;
    color?: ButtonColor;
    onClick: (item: T) => void;
};

type ButtonColor =
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';

type BaseTableProps<T> = {
    data?: T[];
    columns: Column<T>[];
    actions?: Action<T>[];
    showIndex?: boolean;
};

export default function BaseTable<T extends { id: string | number }>({
    data,
    columns,
    actions,
    showIndex = true,
}: BaseTableProps<T>) {
    const TableHeadRow = (
        <TableRow>
            {showIndex && (
                <TableCell
                    sx={{
                        fontWeight: 'bold',
                        backgroundColor: 'action.hover',
                        width: '60px',
                    }}
                >
                    №
                </TableCell>
            )}
            {columns.map((column) => (
                <TableCell
                    key={column.key}
                    sx={{
                        fontWeight: 'bold',
                        backgroundColor: 'action.hover',
                    }}
                >
                    {column.label}
                </TableCell>
            ))}
            {actions && actions.length > 0 && (
                <TableCell
                    sx={{
                        fontWeight: 'bold',
                        backgroundColor: 'action.hover',
                    }}
                >
                    Действия
                </TableCell>
            )}
        </TableRow>
    );

    const renderActions = (item: T) => {
        if (!actions || actions.length === 0) return null;

        return (
            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                }}
            >
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        size="small"
                        variant="outlined"
                        color={action.color ?? 'inherit'}
                        startIcon={action.icon}
                        onClick={() => action.onClick(item)}
                        sx={{
                            minWidth: { xs: 'auto', sm: 'auto' },
                            '& .MuiButton-startIcon': {
                                margin: { xs: 0, sm: '0 8px 0 -4px' },
                            },
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                display: { xs: 'none', lg: 'inline' },
                            }}
                        >
                            {action.label}
                        </Box>
                    </Button>
                ))}
            </Box>
        );
    };

    const DataRows = (
        <>
            {data?.map((item, index) => (
                <TableRow key={item.id} hover>
                    {showIndex && <TableCell>{index + 1}</TableCell>}
                    {columns.map((column) => (
                        <TableCell key={column.key}>
                            {column.render(item)}
                        </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                        <TableCell>{renderActions(item)}</TableCell>
                    )}
                </TableRow>
            ))}
        </>
    );

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table sx={{ tableLayout: 'fixed' }} stickyHeader>
                <TableHead>{TableHeadRow}</TableHead>
                <TableBody>{DataRows}</TableBody>
            </Table>
        </TableContainer>
    );
}

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

type StocksTableProps = {
    stocks?: St[],
    tableHeadArray?: string[],
    actionsArray?: ButtonAction[],
}

export default function StocksTable({stocks}) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                    </TableRow>
                </TableHead>
            </Table>
        </TableContainer>
    );
}
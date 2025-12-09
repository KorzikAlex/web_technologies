import { Fab } from "@mui/material";
import BrokersTable from "../components/BrokersTable";
import AddIcon from '@mui/icons-material/Add';
export default function BrokersPage() {
    return (
        <>
            <BrokersTable
                brokers={[
                    {
                        id: 1,
                        name: "Брокер 1",
                        balance: 10000,
                    },
                    {
                        id: 2,
                        name: "Брокер 2",
                        balance: 25000,
                    },
                ]}
            />
            <Fab
                color="primary"
                aria-label="add"
                sx={
                    {
                        position: 'fixed',
                        bottom: 16,
                        right: 16
                    }
                } >
                <AddIcon />
            </Fab>
        </>
    );
}
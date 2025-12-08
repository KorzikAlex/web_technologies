import BrokersTable from "../../components/BrokersTable/BrokersTable";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function BrokersPage() {
    return (
        <BrokersTable
            brokers={[

            ]}
            tableHeadArray={[
                "Имя",
                "Баланс",
                "Действия"
            ]}
            actionsArray={[
                {
                    label: "Редактировать",
                    onClick: (broker) => console.log("Edit", broker),
                    icon: <EditIcon />,
                    color: "info"
                },
                {
                    label: "Удалить",
                    onClick: (broker) => console.log("Delete", broker),
                    icon: <DeleteIcon />,
                    color: "error"
                }
            ]}
        />
    );
}
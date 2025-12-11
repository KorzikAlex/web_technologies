import type { Company } from '@/interfaces/Company';
import TableChartIcon from '@mui/icons-material/TableChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckIcon from '@mui/icons-material/Check';
import BaseTable from './BaseTable';
import SelectDateDialog from '@/components/dialogs/StocksPage/SelectDateDialog';
import { useState } from 'react';
import type { Dayjs } from 'dayjs';

type CompaniesTableProps = {
    companies?: Company[];
    onDateRangeSelected?: (
        company: Company,
        startDate: Dayjs | null,
        endDate: Dayjs | null,
        viewType: 'table' | 'chart',
    ) => void;
};

export default function CompaniesTable({
    companies,
    onDateRangeSelected,
}: CompaniesTableProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(
        null,
    );
    const [viewType, setViewType] = useState<'table' | 'chart'>('table');

    const handleOpenDialog = (company: Company, type: 'table' | 'chart') => {
        setSelectedCompany(company);
        setViewType(type);
        setDialogOpen(true);
    };

    const handleApplyDates = (
        startDate: Dayjs | null,
        endDate: Dayjs | null,
    ) => {
        if (selectedCompany && onDateRangeSelected) {
            onDateRangeSelected(selectedCompany, startDate, endDate, viewType);
        }
        console.log('Применены даты:', {
            company: selectedCompany,
            startDate: startDate?.format('YYYY-MM-DD'),
            endDate: endDate?.format('YYYY-MM-DD'),
            viewType,
        });
    };

    const columns = [
        {
            key: 'symbol',
            label: 'Обозначение',
            render: (company: Company) => company.symbol,
        },
        {
            key: 'name',
            label: 'Название',
            render: (company: Company) => company.name,
        },
    ];

    const actions = [
        {
            label: 'Таблица',
            icon: <TableChartIcon />,
            color: 'primary' as const,
            onClick: (company: Company) => handleOpenDialog(company, 'table'),
        },
        {
            label: 'График',
            icon: <TimelineIcon />,
            color: 'secondary' as const,
            onClick: (company: Company) => handleOpenDialog(company, 'chart'),
        },
        {
            label: 'Принять участие в торгах',
            color: 'success' as const,
            icon: <CheckIcon />,
            onClick: () => {},
        },
    ];

    return (
        <>
            <BaseTable data={companies} columns={columns} actions={actions} />
            <SelectDateDialog
                open={dialogOpen}
                companyName={selectedCompany?.name}
                onClose={() => setDialogOpen(false)}
                onApply={handleApplyDates}
            />
        </>
    );
}

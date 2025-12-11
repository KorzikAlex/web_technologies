import CompaniesTable from '@/components/tables/CompaniesTable';
import type { Company } from '@/interfaces/Company';
import type { Dayjs } from 'dayjs';

const companiesArray: Company[] = [
    { id: 1, name: 'Apple, Inc.', symbol: 'AAPL' },
    { id: 2, name: 'Starbucks, Inc.', symbol: 'SBUX' },
    { id: 3, name: 'Microsoft, Inc.', symbol: 'MSFT' },
    { id: 4, name: 'Cisco Systems, Inc.', symbol: 'CSCO' },
    { id: 5, name: 'QUALCOMM Incorporated', symbol: 'QCOM' },
    { id: 6, name: 'Amazon.com, Inc.', symbol: 'AMZN' },
    { id: 7, name: 'Tesla, Inc.', symbol: 'TSLA' },
    { id: 8, name: 'Advanced Micro Devices, Inc.', symbol: 'AMD' },
];

export default function StocksPage() {
    const handleDateRangeSelected = (
        company: Company,
        startDate: Dayjs | null,
        endDate: Dayjs | null,
        viewType: 'table' | 'chart',
    ) => {
        console.log('StocksPage: Выбран период для компании', {
            company: company.name,
            symbol: company.symbol,
            startDate: startDate?.format('YYYY-MM-DD'),
            endDate: endDate?.format('YYYY-MM-DD'),
            viewType,
        });
        // TODO: Здесь будет логика для загрузки и отображения данных
        // Например, навигация на страницу с таблицей/графиком или открытие модального окна
    };

    return (
        <CompaniesTable
            companies={companiesArray}
            onDateRangeSelected={handleDateRangeSelected}
        />
    );
}

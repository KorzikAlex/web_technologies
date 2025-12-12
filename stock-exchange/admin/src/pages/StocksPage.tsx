import { useEffect, useState } from 'react';
import CompaniesTable from '@/components/tables/CompaniesTable';
import StocksTableDialog from '@/components/dialogs/StocksPage/StocksTableDialog';
import StocksChartDialog from '@/components/dialogs/StocksPage/StocksChartDialog';
import type { Company } from '@/interfaces/Company';
import type { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStocks, fetchStockHistory, updateStockEnabled } from '@/store/slices/stocksSlice';

export default function StocksPage() {
    const dispatch = useAppDispatch();
    const stocks = useAppSelector((state) => state.stocks.stocks);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [chartDialogOpen, setChartDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    useEffect(() => {
        dispatch(fetchStocks());
    }, [dispatch]);

    const handleDateRangeSelected = (
        company: Company,
        startDate: Dayjs | null,
        endDate: Dayjs | null,
        viewType: 'table' | 'chart',
    ) => {
        setSelectedCompany(company);

        // Fetch historical data with date range
        dispatch(
            fetchStockHistory({
                symbol: company.symbol,
                startDate: startDate?.format('YYYY-MM-DD'),
                endDate: endDate?.format('YYYY-MM-DD'),
            })
        );

        // Open appropriate dialog
        if (viewType === 'table') {
            setTableDialogOpen(true);
        } else {
            setChartDialogOpen(true);
        }
    };

    const handleToggleEnabled = (company: Company, enabled: boolean) => {
        dispatch(updateStockEnabled({ symbol: company.symbol, enabled }));
    };

    // Convert stocks to companies format
    const companies: Company[] = stocks.map((stock) => ({
        id: stock.id,
        name: stock.name,
        symbol: stock.symbol,
        enabled: stock.enabled,
    }));

    // Get history for selected company
    const selectedStock = stocks.find((s) => s.symbol === selectedCompany?.symbol);
    const history = selectedStock?.history || [];

    return (
        <>
            <CompaniesTable
                companies={companies}
                onDateRangeSelected={handleDateRangeSelected}
                onToggleEnabled={handleToggleEnabled}
            />

            {selectedCompany && (
                <>
                    <StocksTableDialog
                        open={tableDialogOpen}
                        companyName={selectedCompany.name}
                        symbol={selectedCompany.symbol}
                        history={history}
                        onClose={() => setTableDialogOpen(false)}
                    />

                    <StocksChartDialog
                        open={chartDialogOpen}
                        companyName={selectedCompany.name}
                        symbol={selectedCompany.symbol}
                        history={history}
                        onClose={() => setChartDialogOpen(false)}
                    />
                </>
            )}
        </>
    );
}

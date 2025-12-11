import { createBrowserRouter } from 'react-router';
import LayoutPage from '@/pages/LayoutPage';
import BrokersPage from '@/pages/BrokersPage';
import StocksPage from '@/pages/StocksPage';
import ExchangePage from '@/pages/ExchangePage';

export const router = createBrowserRouter([
    {
        path: '/',
        Component: LayoutPage,

        children: [
            {
                index: true,
                Component: BrokersPage,
                handle: { title: 'Брокеры' },
            },
            {
                path: 'stocks',
                Component: StocksPage,
                handle: { title: 'Акции' },
            },
            {
                path: 'exchange',
                Component: ExchangePage,
                handle: { title: 'Биржа' },
            },
        ],
    },
]);

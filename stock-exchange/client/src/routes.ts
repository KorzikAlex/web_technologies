import { createBrowserRouter } from "react-router";
import LayoutPage from "./pages/LayoutPage/LayoutPage";
import BrokersPage from "./pages/BrokersPage/BrokersPage";
import StocksPage from "./pages/StocksPage/StocksPage";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: LayoutPage,
        children: [
            {
                index: true,
                Component: BrokersPage
            },
            {
                path: "stocks",
                Component: StocksPage
            }
        ]
    }
]
);
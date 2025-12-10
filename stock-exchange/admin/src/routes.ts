import { createBrowserRouter } from "react-router";
import LayoutPage from "./pages/LayoutPage";
import BrokersPage from "./pages/BrokersPage";
import StocksPage from "./pages/StocksPage";

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
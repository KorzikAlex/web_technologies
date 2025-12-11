import { Outlet, useMatches } from 'react-router';
import { SideNav, AppToolBar } from '@/components/shared';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import {
    People as PeopleIcon,
    TrendingUp as TrendingUpIcon,
    CurrencyExchange as CurrencyExchangeIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

export default function LayoutPage() {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
    const [drawerOpen, setDrawerOpen] = useState(isMdUp);

    useEffect(() => {
        setDrawerOpen(isMdUp);
    }, [isMdUp]);

    const matches = useMatches();
    const currentRoute = matches[matches.length - 1];
    const title = (currentRoute?.handle as { title?: string })?.title;

    const handleDrawerToggle = () => {
        setDrawerOpen((prev) => !prev);
    };

    const navLinks = [
        {
            text: 'Брокеры',
            href: '/',
            icon: <PeopleIcon />,
        },
        {
            text: 'Акции',
            href: '/stocks',
            icon: <TrendingUpIcon />,
        },
        {
            text: 'Биржа',
            href: '/exchange',
            icon: <CurrencyExchangeIcon />,
        },

    ];

    return (
        <Box
            sx={{
                display: 'flex',
            }}
        >
            <AppToolBar title={title} onMenuClick={handleDrawerToggle} />
            <SideNav
                navLinks={navLinks}
                open={drawerOpen}
                onClose={handleDrawerToggle}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}

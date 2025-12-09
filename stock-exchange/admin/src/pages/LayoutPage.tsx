import { Outlet } from "react-router";
import SideNav from "../components/SideNav";
import { Box } from "@mui/material";
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';


export default function LayoutPage() {
    const navLinks = [
        {
            text: "Брокеры",
            href: "/",
            icon: <PeopleIcon />,
        },
        {
            text: "Акции",
            href: "/stocks",
            icon: <TrendingUpIcon />,
        },
    ];

    return (
        <Box
            sx={
                {
                    display: 'flex'
                }
            }
        >
            <SideNav
                navLinks={navLinks}
            />
            <Box
                component="main"
                sx={
                    {
                        flexGrow: 1,
                        p: 3,
                    }
                }
            >
                <Outlet />
            </Box>
        </Box>
    )
}
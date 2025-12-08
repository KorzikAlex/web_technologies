import { Outlet } from "react-router";
import SideNav, { drawerWidth } from "../../components/SideNav/SideNav";
import { Box } from "@mui/material";
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';


export default function LayoutPage() {
    return (
        <Box
            sx={
                {
                    display: 'flex'
                }
            }
        >
            <SideNav
                navLinks={
                    [
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
                    ]
                }
            />
            <Box
                component="main"
                sx={
                    {
                        flexGrow: 1,
                        p: 3,
                        ml: `${drawerWidth}px`
                    }
                }
            >
                <Outlet />
            </Box>
        </Box>
    )
}
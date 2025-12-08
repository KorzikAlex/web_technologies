import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { NavLink } from "react-router";

export type routerProps = {
    text: string,
    href: string,
    icon?: React.ReactNode,
};

export const drawerWidth = 240;

type SideNavProps = {
    navLinks?: routerProps[]
}

export default function SideNav({ navLinks }: SideNavProps) {
    return (
        <>
            <Drawer
                variant="permanent"
                anchor="left"
                sx={
                    {
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }
                }
            >
                <List>
                    {
                        navLinks?.map(
                            (link) => (
                                <ListItem key={link.text}>
                                    <ListItemButton
                                        component={NavLink}
                                        to={link.href}
                                    >
                                        <ListItemIcon>{link.icon}</ListItemIcon>
                                        <ListItemText primary={link.text} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        )
                    }
                </List>
            </Drawer>
        </>
    );
}
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";

import { NavLink } from "react-router";

export type routerProps = {
    text: string,
    href: string,
    icon?: React.ReactNode,
};

export const drawerWidth = 240;

type SideNavProps = {
    navLinks?: routerProps[];
    open: boolean;
    onClose: () => void;
}

export default function SideNav({ navLinks, open, onClose }: SideNavProps) {
    const NavLinksList = (
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
    );

    return (
        <>
            <Drawer
                variant="permanent"
                anchor="left"
                open={open}
                sx={{
                    width: open ? drawerWidth : 0,
                    flexShrink: 0,
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        transition: 'transform 0.3s',
                        transform: open ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
                    },
                }}
            >
                <Toolbar />
                {NavLinksList}
            </Drawer>
            <Drawer
                variant="temporary"
                anchor="left"
                open={open}
                onClose={onClose}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar />
                {NavLinksList}
            </Drawer>
        </>
    );
}
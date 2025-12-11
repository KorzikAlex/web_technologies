import { AppBar, IconButton, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

type AppToolBarProps = {
    title?: string;
    onMenuClick?: () => void;
};

export default function AppToolBar({ title, onMenuClick }: AppToolBarProps) {
    return (
        <AppBar sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar
                sx={{
                    fontSize: '1.2rem',
                    fontFamily: 'Arial',
                }}
            >
                <IconButton
                    color="inherit"
                    aria-label="toggle drawer"
                    onClick={onMenuClick}
                    edge="start"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                {title ?? 'Админ-Панель'}
            </Toolbar>
        </AppBar>
    );
}

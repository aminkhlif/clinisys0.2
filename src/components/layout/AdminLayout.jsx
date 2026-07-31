import { useState } from 'react';
import { AppBar, Box, Drawer, Toolbar, Stack, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAppTheme } from '../../context/ThemeContext.jsx';
import AdminSidebar from '../admin/AdminSidebar.jsx';
import UserMenu from '../auth/UserMenu.jsx';
import { dotGridBackgroundSx } from '../../theme/backgrounds.js';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 0;

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          transition: 'margin-left 0.3s ease, width 0.3s ease',
        }}
      >
        <Toolbar sx={{ minHeight: 60, justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={toggleSidebar}
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                color: 'text.secondary',
                '&:hover': { color: 'text.primary', bgcolor: 'action.hover' }
              }}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            <UserMenu />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.default',
            color: 'text.primary',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
      >
        <AdminSidebar />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          py: { xs: 3, sm: 4, md: 5 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100%',
          transition: 'width 0.3s ease',
          ...dotGridBackgroundSx,
        }}
      >
        <Toolbar sx={{ minHeight: 60, mb: 2 }} />
        {children}
      </Box>
    </Box>
  );
}

export default AdminLayout;

function ThemeToggle() {
  const { mode, toggleTheme } = useAppTheme();
  return (
    <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1, color: 'text.primary' }}>
      {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
    </IconButton>
  );
}

// src/components/layout/MainLayout.jsx
import { useState } from 'react';
import { AppBar, Box, Drawer, Toolbar, Typography, Stack, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAppTheme } from '../../context/ThemeContext.jsx';
import Sidebar from './Sidebar.jsx';
import UserMenu from '../auth/UserMenu.jsx';
import { dotGridBackgroundSx } from '../../theme/backgrounds.js';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 0;

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
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
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ display: { md: 'none' } }}>
              <Box
                component="svg"
                viewBox="0 0 32 32"
                sx={{ width: 24, height: 24 }}
              >
                
                <g transform="translate(16 16)">
                  <g>
                    <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.5s" repeatCount="indefinite" />
                    <path d="M-3 -11 H3 V-3 H11 V3 H3 V11 H-3 V3 H-11 V-3 H-3 Z" fill="currentColor" opacity="0.15" />
                    <path d="M-8 0 L-4 0 L-2 -3 L1 5 L3.5 -2 L5 0 L8 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10 5 10" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite" />
                </circle>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>Application</Typography>
            </Stack>
          </Stack>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            <UserMenu  />
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
        <Sidebar />
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

export default MainLayout;

function ThemeToggle() {
  const { mode, toggleTheme } = useAppTheme();
  return (
    <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1, color: 'text.primary' }}>
      {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
    </IconButton>
  );
}

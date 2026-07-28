import { AppBar, Box, Toolbar, Typography, Stack, Container, IconButton } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAppTheme } from '../../context/ThemeContext.jsx';
import { Link } from 'react-router-dom';
import UserMenu from '../auth/UserMenu.jsx';
import { dotGridBackgroundSx } from '../../theme/backgrounds.js';

function AdminLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ minHeight: 60, justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <Stack component={Link} to="/" direction="row" alignItems="center" spacing={1.5} sx={{ textDecoration: 'none' }}>
            <Box component="svg" viewBox="0 0 32 32" sx={{ width: 24, height: 24 }}>
              
              <g transform="translate(16 16)">
                <g>
                  <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.5s" repeatCount="indefinite" />
                  <path d="M-3 -11 H3 V-3 H11 V3 H3 V11 H-3 V3 H-11 V-3 H-3 Z" fill="#0D9488" opacity="0.15" />
                  <path d="M-8 0 L-4 0 L-2 -3 L1 5 L3.5 -2 L5 0 L8 0" fill="none" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
              <circle cx="16" cy="16" r="14" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="20 10 5 10" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite" />
              </circle>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>Application</Typography>
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            <UserMenu  />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          py: { xs: 3, sm: 4, md: 5 },
          width: '100%',
          ...dotGridBackgroundSx,
        }}
      >
        <Toolbar sx={{ minHeight: 60, mb: 2 }} />
        <Container maxWidth="lg">
          {children}
        </Container>
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

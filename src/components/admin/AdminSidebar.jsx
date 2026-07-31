// src/components/admin/AdminSidebar.jsx
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Stack, Divider, alpha } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

const TEAL = '#0D9488';

const navItems = [
  { label: 'Tableau de bord', icon: <DashboardOutlinedIcon />, path: '/admin' },
  { label: 'Utilisateurs', icon: <PeopleOutlinedIcon />, path: '/admin/utilisateurs' },
  { label: 'Matrice permissions', icon: <GridOnOutlinedIcon />, path: '/admin/permissions' },
  { label: 'Journal d\'audit', icon: <HistoryOutlinedIcon />, path: '/admin/journal' },
];

function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}>
      {/* Header */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1, px: 0.5, mb: 2 }}>
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
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Application
          </Typography>
        </Stack>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            fontSize: '1.1rem',
            lineHeight: 1.3,
            px: 0.5,
          }}
        >
          Administration
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, mb: 2 }} />

      {/* Navigation Items */}
      <List sx={{ px: 1, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
          
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={isActive}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                px: 1.5,
                py: 1,
                minHeight: 44,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  bgcolor: alpha(TEAL, 0.12),
                  '&:hover': {
                    bgcolor: alpha(TEAL, 0.16),
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40, 
                  color: isActive ? TEAL : 'text.secondary',
                  transition: 'color 0.2s ease',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    color: isActive ? TEAL : 'text.primary',
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Back to App */}
      <Box sx={{ px: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton
          component={Link}
          to="/"
          sx={{
            borderRadius: 1.5,
            px: 1.5,
            py: 1,
            minHeight: 44,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
            <ArrowBackOutlinedIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Retour à l'application"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: 500,
                fontSize: '0.875rem',
                color: 'text.primary',
              },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default AdminSidebar;

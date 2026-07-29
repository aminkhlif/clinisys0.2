import { Tabs, Tab, Box, Typography, Stack, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

export function AdminNav() {
  const location = useLocation();
  const path = location.pathname;

  let currentTab = 0;
  if (path === '/admin/utilisateurs') currentTab = 1;
  else if (path === '/admin/permissions') currentTab = 2;
  else if (path === '/admin/journal') currentTab = 3;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          component={Link} 
          to="/" 
          startIcon={<ArrowBackOutlinedIcon />} 
          sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, ml: -1 }}
        >
          Retour à l'application
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
          Administration
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} aria-label="admin navigation tabs">
          <Tab 
            icon={<DashboardOutlinedIcon sx={{ mr: 1, mb: '0 !important' }} />} 
            iconPosition="start" 
            label="Tableau de bord" 
            component={Link} 
            to="/admin" 
            sx={{ fontWeight: 600, minHeight: 48 }}
          />
          <Tab 
            icon={<PeopleOutlinedIcon sx={{ mr: 1, mb: '0 !important' }} />} 
            iconPosition="start" 
            label="Utilisateurs" 
            component={Link} 
            to="/admin/utilisateurs" 
            sx={{ fontWeight: 600, minHeight: 48 }}
          />
          <Tab 
            icon={<GridOnOutlinedIcon sx={{ mr: 1, mb: '0 !important' }} />} 
            iconPosition="start" 
            label="Matrice permissions" 
            component={Link} 
            to="/admin/permissions" 
            sx={{ fontWeight: 600, minHeight: 48 }}
          />
          <Tab 
            icon={<HistoryOutlinedIcon sx={{ mr: 1, mb: '0 !important' }} />} 
            iconPosition="start" 
            label="Journal d'audit" 
            component={Link} 
            to="/admin/journal" 
            sx={{ fontWeight: 600, minHeight: 48 }}
          />
        </Tabs>
      </Box>
    </Box>
  );
}

export default AdminNav;

import { useEffect, useState } from 'react';
import { Box, Typography, Stack, Card, CardContent, CircularProgress, Grid } from '@mui/material';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import AdminNav from '../components/admin/AdminNav.jsx';

function StatCard({ label, value, loading, icon, color }) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 4, 
          backgroundColor: color || 'primary.main' 
        }} 
      />
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              p: 1.5, 
              borderRadius: 2, 
              backgroundColor: `${color || 'primary.main'}15`,
              color: color || 'primary.main'
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </Typography>
        </Stack>
        
        <Box sx={{ mt: 'auto', pt: 2 }}>
          {loading ? (
            <CircularProgress size={28} thickness={5} sx={{ color: color || 'primary.main' }} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await axiosClient.get('/admin/dashboard/stats');
        setStats(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ pb: 6 }}>
        <AdminNav />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              label="Modules" 
              value={stats?.nombreModules} 
              loading={loading} 
              icon={<ViewModuleOutlinedIcon />} 
              color="#0D9488" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              label="Menus" 
              value={stats?.nombreMenus} 
              loading={loading} 
              icon={<MenuBookOutlinedIcon />} 
              color="#0EA5E9" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              label="Sous-menus" 
              value={stats?.nombreSousMenus} 
              loading={loading} 
              icon={<AccountTreeOutlinedIcon />} 
              color="#8B5CF6" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              label="Images" 
              value={stats?.nombreImages} 
              loading={loading} 
              icon={<ImageOutlinedIcon />} 
              color="#F59E0B" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              label="Utilisateurs Total" 
              value={stats?.nombreUtilisateurs} 
              loading={loading} 
              icon={<PeopleAltOutlinedIcon />} 
              color="#10B981" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              label="Utilisateurs Actifs" 
              value={stats?.nombreUtilisateursActifs} 
              loading={loading} 
              icon={<PersonOutlineOutlinedIcon />} 
              color="#14B8A6" 
            />
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboardPage;

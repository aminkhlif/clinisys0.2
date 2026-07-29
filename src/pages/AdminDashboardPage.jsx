import { useEffect, useState } from 'react';
import { Box, Typography, Stack, Card, CardContent, CircularProgress, Grid, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import AdminNav from '../components/admin/AdminNav.jsx';
import { useNavigate } from 'react-router-dom';

function StatCard({ label, value, loading, icon, color }) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 4, 
          backgroundColor: color || 'primary.main',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }} 
      />
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              p: 1, 
              borderRadius: 1.5, 
              backgroundColor: `${color || 'primary.main'}15`,
              color: color || 'primary.main'
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            {label}
          </Typography>
        </Stack>
        
        <Box sx={{ mt: 'auto' }}>
          {loading ? (
            <CircularProgress size={24} thickness={5} sx={{ color: color || 'primary.main' }} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
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
  const navigate = useNavigate();

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
      <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <AdminNav />
        
        {/* Stats principales - 6 cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              label="Modules" 
              value={stats?.nombreModules} 
              loading={loading} 
              icon={<ViewModuleOutlinedIcon />} 
              color="#0D9488" 
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              label="Menus" 
              value={stats?.nombreMenus} 
              loading={loading} 
              icon={<MenuBookOutlinedIcon />} 
              color="#0EA5E9" 
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              label="Sous-menus" 
              value={stats?.nombreSousMenus} 
              loading={loading} 
              icon={<AccountTreeOutlinedIcon />} 
              color="#8B5CF6" 
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              label="Images" 
              value={stats?.nombreImages} 
              loading={loading} 
              icon={<ImageOutlinedIcon />} 
              color="#F59E0B" 
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              label="Utilisateurs Total" 
              value={stats?.nombreUtilisateurs} 
              loading={loading} 
              icon={<PeopleAltOutlinedIcon />} 
              color="#10B981" 
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard 
              label="Utilisateurs Actifs" 
              value={stats?.nombreUtilisateursActifs} 
              loading={loading} 
              icon={<PersonOutlineOutlinedIcon />} 
              color="#14B8A6" 
            />
          </Grid>
        </Grid>

        {/* Stats additionnelles - 3 cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatCard 
              label="Administrateurs" 
              value={stats?.nombreAdmins} 
              loading={loading} 
              icon={<AdminPanelSettingsIcon />} 
              color="#EF4444" 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard 
              label="Utilisateurs Standard" 
              value={stats?.nombreUtilisateursStandard} 
              loading={loading} 
              icon={<PersonIcon />} 
              color="#3B82F6" 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard 
              label="Sans module" 
              value={stats?.utilisateursSansModule} 
              loading={loading} 
              icon={<WarningIcon />} 
              color="#F59E0B" 
            />
          </Grid>
        </Grid>

        {/* Top 5 modules + Alert card */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 1, 
                    borderRadius: 1.5, 
                    backgroundColor: '#0D948815',
                    color: '#0D9488'
                  }}>
                    <TrendingUpIcon fontSize="small" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Top 5 modules les plus utilisés</Typography>
                </Stack>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : stats?.topModules?.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {stats.topModules.map((module, index) => (
                      <ListItem 
                        key={module.moduleId} 
                        sx={{ 
                          px: 0, 
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Box sx={{ 
                                  width: 28, 
                                  height: 28, 
                                  borderRadius: '50%', 
                                  bgcolor: '#0D948815', 
                                  color: '#0D9488',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 700
                                }}>
                                  {index + 1}
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {module.nomModule}
                                </Typography>
                              </Stack>
                              <Chip 
                                label={`${module.nombreUtilisateurs} utilisateurs`} 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#0D948815',
                                  color: '#0D9488',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Stack>
                          }
                          secondary={
                            <Typography 
                              component="div"
                              sx={{ 
                                width: `${(module.nombreUtilisateurs / Math.max(...stats.topModules.map(m => m.nombreUtilisateurs))) * 100}%`,
                                height: 8,
                                bgcolor: '#0D9488',
                                borderRadius: 4,
                                mt: 1.5,
                                maxWidth: '100%'
                              }}
                            />
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Aucune donnée disponible</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              background: stats?.utilisateursSansModule > 0 ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : 'background.paper'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 1, 
                    borderRadius: 1.5, 
                    backgroundColor: '#F59E0B25',
                    color: '#F59E0B'
                  }}>
                    <WarningIcon fontSize="small" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Utilisateurs sans module</Typography>
                </Stack>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : stats?.utilisateursSansModule > 0 ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#B45309', mb: 1 }}>
                      {stats.utilisateursSansModule}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#92400E', mb: 3 }}>
                      utilisateurs sans accès
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        bgcolor: '#F59E0B',
                        '&:hover': { bgcolor: '#D97706' },
                        borderRadius: 2
                      }}
                      onClick={() => navigate('/admin/utilisateurs')}
                      fullWidth
                      startIcon={<PeopleAltOutlinedIcon />}
                    >
                      Gérer les utilisateurs
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#10B981', mb: 1 }} />
                    <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                      Tous les utilisateurs ont au moins un module
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboardPage;

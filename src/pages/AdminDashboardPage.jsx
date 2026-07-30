import { useEffect, useState } from 'react';
import { Box, Typography, Stack, Card, CardContent, CircularProgress, Grid, List, ListItem, ListItemText, Chip, Button, Fade, Skeleton, alpha } from '@mui/material';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSnackbar } from 'notistack';
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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color || 'primary.main'} 0%, ${alpha(color || 'primary.main', 0.6)} 100%)`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              p: 1.2, 
              borderRadius: 2, 
              backgroundColor: alpha(color || 'primary.main', 0.1),
              color: color || 'primary.main',
              transition: 'all 0.3s ease',
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
            {label}
          </Typography>
        </Stack>
        
        <Box sx={{ mt: 'auto' }}>
          {loading ? (
            <Skeleton variant="text" width={80} height={40} sx={{ borderRadius: 1 }} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1, fontSize: '2rem' }}>
              {value?.toLocaleString() || 0}
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
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const loadStats = async () => {
    try {
      const res = await axiosClient.get('/admin/dashboard/stats');
      setStats(res.data);
    } catch (e) {
      enqueueSnackbar('Erreur lors du chargement des statistiques', { variant: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  return (
    <AdminLayout>
      <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <AdminNav />
        
        {/* Header with refresh button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Tableau de bord</Typography>
            <Typography variant="body2" color="text.secondary">Vue d'ensemble de votre application</Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ borderRadius: 2 }}
          >
            Actualiser
          </Button>
        </Stack>
        
        {/* Stats principales et secondaires - 2 large cards on same row */}
        <Fade in={!loading} timeout={600}>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Statistiques principales</Typography>
                  <Grid container spacing={2.5} columns={2}>
                    <Grid item xs={1}>
                      <StatCard 
                        label="Modules" 
                        value={stats?.nombreModules} 
                        loading={loading} 
                        icon={<ViewModuleOutlinedIcon />} 
                        color="#0D9488" 
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <StatCard 
                        label="Menus" 
                        value={stats?.nombreMenus} 
                        loading={loading} 
                        icon={<MenuBookOutlinedIcon />} 
                        color="#0EA5E9" 
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <StatCard 
                        label="Images" 
                        value={stats?.nombreImages} 
                        loading={loading} 
                        icon={<ImageOutlinedIcon />} 
                        color="#F59E0B" 
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <StatCard 
                        label="Utilisateurs" 
                        value={stats?.nombreUtilisateurs} 
                        loading={loading} 
                        icon={<PeopleAltOutlinedIcon />} 
                        color="#10B981" 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Statistiques détaillées</Typography>
                  <Grid container spacing={2.5} columns={2}>
                    <Grid item xs={1}>
                      <StatCard 
                        label="Sous-menus" 
                        value={stats?.nombreSousMenus} 
                        loading={loading} 
                        icon={<AccountTreeOutlinedIcon />} 
                        color="#8B5CF6" 
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <StatCard 
                        label="Utilisateurs Actifs" 
                        value={stats?.nombreUtilisateursActifs} 
                        loading={loading} 
                        icon={<PersonOutlineOutlinedIcon />} 
                        color="#14B8A6" 
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <StatCard 
                        label="Administrateurs" 
                        value={stats?.nombreAdmins} 
                        loading={loading} 
                        icon={<AdminPanelSettingsIcon />} 
                        color="#EF4444" 
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <StatCard 
                        label="Sans module" 
                        value={stats?.utilisateursSansModule} 
                        loading={loading} 
                        icon={<WarningIcon />} 
                        color="#F59E0B" 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Top 5 modules + Alert card */}
        <Fade in={!loading} timeout={1000}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        p: 1, 
                        borderRadius: 1.5, 
                        backgroundColor: alpha('#0D9488', 0.1),
                        color: '#0D9488'
                      }}>
                        <TrendingUpIcon fontSize="small" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Top 5 modules les plus utilisés</Typography>
                    </Stack>
                    <Button
                      size="small"
                      onClick={() => navigate('/')}
                      sx={{ textTransform: 'none' }}
                    >
                      Voir tout
                    </Button>
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
                            py: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha('#0D9488', 0.04),
                              borderRadius: 1.5,
                            },
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Box sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    borderRadius: '50%', 
                                    bgcolor: alpha('#0D9488', 0.1), 
                                    color: '#0D9488',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.85rem',
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
                                    bgcolor: alpha('#0D9488', 0.1),
                                    color: '#0D9488',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Stack>
                            }
                            secondary={
                              <Box sx={{ mt: 1.5 }}>
                                <Box 
                                  sx={{ 
                                    width: `${(module.nombreUtilisateurs / Math.max(...stats.topModules.map(m => m.nombreUtilisateurs))) * 100}%`,
                                    height: 6,
                                    bgcolor: alpha('#0D9488', 0.2),
                                    borderRadius: 3,
                                    position: 'relative',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <Box 
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      height: '100%',
                                      width: `${(module.nombreUtilisateurs / Math.max(...stats.topModules.map(m => m.nombreUtilisateurs))) * 100}%`,
                                      bgcolor: '#0D9488',
                                      borderRadius: 3,
                                      transition: 'width 0.6s ease',
                                    }}
                                  />
                                </Box>
                              </Box>
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
                background: stats?.utilisateursSansModule > 0 
                  ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' 
                  : alpha('#10B981', 0.05),
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      p: 1, 
                      borderRadius: 1.5, 
                      backgroundColor: stats?.utilisateursSansModule > 0 ? alpha('#F59E0B', 0.2) : alpha('#10B981', 0.15),
                      color: stats?.utilisateursSansModule > 0 ? '#F59E0B' : '#10B981'
                    }}>
                      {stats?.utilisateursSansModule > 0 ? <WarningIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {stats?.utilisateursSansModule > 0 ? 'Utilisateurs sans module' : 'Accès complet'}
                    </Typography>
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
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
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
                      <CheckCircleIcon sx={{ fontSize: 56, color: '#10B981', mb: 1.5 }} />
                      <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                        Tous les utilisateurs ont au moins un module
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboardPage;

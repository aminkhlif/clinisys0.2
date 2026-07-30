import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, CircularProgress,
  Grid, List, Chip, Button, Fade, Skeleton, alpha,
} from '@mui/material';
import ViewModuleOutlinedIcon    from '@mui/icons-material/ViewModuleOutlined';
import MenuBookOutlinedIcon      from '@mui/icons-material/MenuBookOutlined';
import AccountTreeOutlinedIcon   from '@mui/icons-material/AccountTreeOutlined';
import ImageOutlinedIcon         from '@mui/icons-material/ImageOutlined';
import PeopleAltOutlinedIcon     from '@mui/icons-material/PeopleAltOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AdminPanelSettingsIcon    from '@mui/icons-material/AdminPanelSettings';
import TrendingUpIcon            from '@mui/icons-material/TrendingUp';
import WarningAmberIcon          from '@mui/icons-material/WarningAmber';
import CheckCircleIcon           from '@mui/icons-material/CheckCircle';
import RefreshIcon               from '@mui/icons-material/Refresh';
import { useSnackbar }           from 'notistack';
import axiosClient               from '../api/axiosClient.js';
import AdminLayout               from '../components/layout/AdminLayout.jsx';
import AdminNav                  from '../components/admin/AdminNav.jsx';
import { useNavigate }           from 'react-router-dom';

const TEAL   = '#0D9488';
const AMBER  = '#D97706';
const RED    = '#EF4444';
const PURPLE = '#7C3AED';
const SKY    = '#0EA5E9';
const GREEN  = '#10B981';

function StatCard({ label, value, loading, icon, color }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          borderColor: alpha(color, 0.5),
          boxShadow: `0 0 0 2px ${alpha(color, 0.12)}`,
          transform: 'translateY(-2px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          background: color,
          borderRadius: '2px 0 0 2px',
        },
      }}
    >
      <CardContent sx={{ p: 1.5, pl: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block', color: 'text.secondary', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.62rem',
                mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {label}
            </Typography>
            {loading
              ? <Skeleton variant="text" width={48} height={34} sx={{ borderRadius: 1 }} />
              : (
                <Typography sx={{ fontWeight: 800, lineHeight: 1, color: 'text.primary', fontSize: '1.6rem' }}>
                  {(value ?? 0).toLocaleString()}
                </Typography>
              )}
          </Box>
          <Box sx={{ flexShrink: 0, p: 0.75, borderRadius: 1.5, bgcolor: alpha(color, 0.1), color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ModuleBar({ module, index, max }) {
  const pct = max > 0 ? (module.nombreUtilisateurs / max) * 100 : 0;
  return (
    <Box sx={{ py: 1.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 24, height: 24, borderRadius: '50%',
              bgcolor: index === 0 ? alpha(TEAL, 0.15) : 'action.hover',
              color: index === 0 ? TEAL : 'text.secondary',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{module.nomModule}</Typography>
        </Stack>
        <Chip label={`${module.nombreUtilisateurs} utilisateurs`} size="small" sx={{ bgcolor: alpha(TEAL, 0.08), color: TEAL, fontWeight: 600, fontSize: '0.72rem', height: 22 }} />
      </Stack>
      <Box sx={{ width: '100%', height: 5, bgcolor: alpha(TEAL, 0.12), borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: TEAL, borderRadius: 3, transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </Box>
    </Box>
  );
}

function AdminDashboardPage() {
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate            = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const loadStats = async () => {
    try {
      const res = await axiosClient.get('/admin/dashboard/stats');
      setStats(res.data);
    } catch {
      enqueueSnackbar('Erreur lors du chargement des statistiques', { variant: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadStats(); }, []);
  const handleRefresh = () => { setRefreshing(true); loadStats(); };

  const allStats = [
    { label: 'Modules',      key: 'nombreModules',            icon: <ViewModuleOutlinedIcon fontSize="small" />,    color: TEAL   },
    { label: 'Menus',        key: 'nombreMenus',              icon: <MenuBookOutlinedIcon fontSize="small" />,      color: SKY    },
    { label: 'Sous-menus',   key: 'nombreSousMenus',          icon: <AccountTreeOutlinedIcon fontSize="small" />,   color: PURPLE },
    { label: 'Images',       key: 'nombreImages',             icon: <ImageOutlinedIcon fontSize="small" />,         color: AMBER  },
    { label: 'Utilisateurs', key: 'nombreUtilisateurs',       icon: <PeopleAltOutlinedIcon fontSize="small" />,     color: GREEN  },
    { label: 'Actifs',       key: 'nombreUtilisateursActifs', icon: <PersonOutlineOutlinedIcon fontSize="small" />, color: TEAL   },
    { label: 'Admins',       key: 'nombreAdmins',             icon: <AdminPanelSettingsIcon fontSize="small" />,    color: RED    },
    { label: 'Sans module',  key: 'utilisateursSansModule',   icon: <WarningAmberIcon fontSize="small" />,          color: AMBER  },
  ];

  const maxUsers      = stats?.topModules?.length ? Math.max(...stats.topModules.map(m => m.nombreUtilisateurs)) : 1;
  const noModuleCount = stats?.utilisateursSansModule ?? 0;

  return (
    <>
      <style>{`@keyframes dashSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <AdminLayout>
        <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <AdminNav />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25 }}>Tableau de bord</Typography>
            <Typography variant="body2" color="text.secondary">Vue d'ensemble de votre application</Typography>
          </Box>

          {/* 8 cards sur une ligne + bouton Actualiser */}
          <Fade in timeout={500}>
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em' }}>
                  Statistiques
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon sx={{ fontSize: '1rem !important', animation: refreshing ? 'dashSpin 0.8s linear infinite' : 'none' }} />}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Actualiser
                </Button>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: 1.5,
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(4, 1fr)' },
                  '@media (max-width: 600px)':  { gridTemplateColumns: 'repeat(2, 1fr)' },
                }}
              >
                {allStats.map(({ label, key, icon, color }) => (
                  <StatCard key={key} label={label} value={stats?.[key]} loading={loading} icon={icon} color={color} />
                ))}
              </Box>
            </Box>
          </Fade>

          {/* Top 5 + alerte */}
          <Fade in={!loading} timeout={800}>
            <Grid container spacing={2.5}>

              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(TEAL, 0.1), color: TEAL, display: 'flex' }}>
                          <TrendingUpIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Top 5 modules les plus utilisés</Typography>
                      </Stack>
                      <Button size="small" onClick={() => navigate('/')} sx={{ textTransform: 'none', fontWeight: 600, color: TEAL }}>
                        Voir tout
                      </Button>
                    </Stack>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={28} sx={{ color: TEAL }} /></Box>
                    ) : stats?.topModules?.length > 0 ? (
                      <List disablePadding>
                        {stats.topModules.map((module, i) => (
                          <ModuleBar key={module.moduleId} module={module} index={i} max={maxUsers} />
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ py: 5, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Aucune donnée disponible</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card
                  sx={{
                    borderRadius: 2, border: '1px solid', boxShadow: 'none', height: '100%',
                    borderColor: noModuleCount > 0 ? alpha(AMBER, 0.4) : alpha(GREEN, 0.4),
                    bgcolor:     noModuleCount > 0 ? alpha(AMBER, 0.04) : alpha(GREEN, 0.04),
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                      <Box sx={{ p: 0.75, borderRadius: 1.5, display: 'flex', bgcolor: noModuleCount > 0 ? alpha(AMBER, 0.15) : alpha(GREEN, 0.15), color: noModuleCount > 0 ? AMBER : GREEN }}>
                        {noModuleCount > 0 ? <WarningAmberIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {noModuleCount > 0 ? 'Accès incomplets' : 'Accès complet'}
                      </Typography>
                    </Stack>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={28} /></Box>
                    ) : noModuleCount > 0 ? (
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 800, color: AMBER, lineHeight: 1, mb: 0.5 }}>{noModuleCount}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {noModuleCount === 1 ? 'utilisateur sans accès' : 'utilisateurs sans accès'}
                        </Typography>
                        <Button
                          variant="contained" fullWidth startIcon={<PeopleAltOutlinedIcon />}
                          onClick={() => navigate('/admin/utilisateurs')}
                          sx={{ bgcolor: AMBER, '&:hover': { bgcolor: '#B45309' }, borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                        >
                          Gérer les utilisateurs
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 48, color: GREEN, mb: 1.5 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Tous les utilisateurs ont au moins un module assigné.
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
    </>
  );
}

export default AdminDashboardPage;
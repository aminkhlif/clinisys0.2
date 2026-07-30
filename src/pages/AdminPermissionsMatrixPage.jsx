// src/pages/AdminPermissionsMatrixPage.jsx
import { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Tooltip, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Stack, CircularProgress, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import AdminNav from '../components/admin/AdminNav.jsx';
import { useSnackbar } from 'notistack';

function AdminPermissionsMatrixPage() {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enCoursId, setEnCoursId] = useState(null);
  const [rechercheUtilisateur, setRechercheUtilisateur] = useState('');
  const [rechercheModule, setRechercheModule] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  
  // Copy permissions dialog
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [utilisateurSource, setUtilisateurSource] = useState(null);
  const [utilisateursCibles, setUtilisateursCibles] = useState([]);
  const [copyLoading, setCopyLoading] = useState(false);

  const loadMatrix = async () => {
    setLoading(true);
    try {
      const params = {
        rechercheUtilisateur: rechercheUtilisateur || undefined,
        rechercheModule: rechercheModule || undefined
      };
      const res = await axiosClient.get('/admin/permissions/matrice', { params });
      setMatrix(res.data);
    } catch (e) {
      enqueueSnackbar('Erreur lors du chargement de la matrice', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => loadMatrix(), 300);
    return () => clearTimeout(delay);
  }, [rechercheUtilisateur, rechercheModule]);

  const estCoche = (user, moduleId) => (user.modulesVisiblesIds || []).includes(moduleId);

  const toggleModule = async (user, moduleId) => {
    if (user.role === 'ADMIN') return;
    const cle = `${user.id}-${moduleId}`;
    const coche = estCoche(user, moduleId);
    setEnCoursId(cle);
    
    // Optimistic update
    const actuels = user.modulesVisiblesIds || [];
    const nouveaux = coche ? actuels.filter(id => id !== moduleId) : [...actuels, moduleId];
    setMatrix(prev => ({
      ...prev,
      utilisateurs: prev.utilisateurs.map(u => 
        u.id === user.id ? { ...u, modulesVisiblesIds: nouveaux } : u
      )
    }));

    try {
      await axiosClient.patch(`/admin/utilisateurs/${user.id}/modules-visibles`, { moduleIds: nouveaux });
    } catch (e) {
      // Rollback
      setMatrix(prev => ({
        ...prev,
        utilisateurs: prev.utilisateurs.map(u => 
          u.id === user.id ? { ...u, modulesVisiblesIds: actuels } : u
        )
      }));
      enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' });
    } finally {
      setEnCoursId(null);
    }
  };

  const toutCocher = async (userId) => {
    const user = matrix.utilisateurs.find(u => u.id === userId);
    if (!user || user.role === 'ADMIN') return;
    
    const tousModuleIds = matrix.tousModules.map(m => m.id);
    setMatrix(prev => ({
      ...prev,
      utilisateurs: prev.utilisateurs.map(u => 
        u.id === userId ? { ...u, modulesVisiblesIds: tousModuleIds } : u
      )
    }));

    try {
      await axiosClient.patch(`/admin/permissions/matrice/utilisateur/${userId}/tout-cocher`);
      enqueueSnackbar('Tous les modules ont été autorisés', { variant: 'success' });
    } catch (e) {
      loadMatrix();
      enqueueSnackbar('Erreur lors de l\'autorisation', { variant: 'error' });
    }
  };

  const toutDecocher = async (userId) => {
    const user = matrix.utilisateurs.find(u => u.id === userId);
    if (!user || user.role === 'ADMIN') return;
    
    setMatrix(prev => ({
      ...prev,
      utilisateurs: prev.utilisateurs.map(u => 
        u.id === userId ? { ...u, modulesVisiblesIds: [] } : u
      )
    }));

    try {
      await axiosClient.patch(`/admin/permissions/matrice/utilisateur/${userId}/tout-decocher`);
      enqueueSnackbar('Tous les modules ont été retirés', { variant: 'success' });
    } catch (e) {
      loadMatrix();
      enqueueSnackbar('Erreur lors du retrait', { variant: 'error' });
    }
  };

  const openCopyDialog = (user) => {
    setUtilisateurSource(user);
    setUtilisateursCibles([]);
    setCopyDialogOpen(true);
  };

  const copyPermissions = async () => {
    if (!utilisateurSource || utilisateursCibles.length === 0) return;
    
    setCopyLoading(true);
    try {
      await axiosClient.post('/admin/permissions/matrice/copier-permissions', {
        utilisateurSourceId: utilisateurSource.id,
        utilisateurCibleIds: utilisateursCibles
      });
      enqueueSnackbar('Permissions copiées avec succès', { variant: 'success' });
      setCopyDialogOpen(false);
      loadMatrix();
    } catch (e) {
      enqueueSnackbar('Erreur lors de la copie des permissions', { variant: 'error' });
    } finally {
      setCopyLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <AdminNav />
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Box>
      </AdminLayout>
    );
  }

  const filteredUsers = matrix?.utilisateurs || [];
  const filteredModules = matrix?.tousModules || [];

  return (
    <AdminLayout>
      <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <AdminNav />

        {/* Search bars */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                size="small"
                placeholder="Rechercher un utilisateur..."
                value={rechercheUtilisateur}
                onChange={(e) => setRechercheUtilisateur(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: 280 } }}
              />
              <TextField
                size="small"
                placeholder="Rechercher un module..."
                value={rechercheModule}
                onChange={(e) => setRechercheModule(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: 280 } }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {filteredUsers.length} utilisateurs × {filteredModules.length} modules
            </Typography>
          </Stack>
        </Paper>

        {filteredModules.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Aucun module à afficher.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      bgcolor: 'grey.50',
                      fontWeight: 700,
                      minWidth: 220,
                    }}
                  >
                    Utilisateur
                  </TableCell>
                  {filteredModules.map((m) => (
                    <TableCell key={m.id} align="center" sx={{ fontWeight: 700, minWidth: 100, px: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                        {m.nom}
                      </Typography>
                    </TableCell>
                  ))}
                  <TableCell 
                    align="center" 
                    sx={{ 
                      position: 'sticky', 
                      right: 0, 
                      zIndex: 3, 
                      bgcolor: 'grey.50',
                      fontWeight: 700,
                      minWidth: 120,
                      px: 1
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        bgcolor: 'background.paper',
                        minWidth: 220,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          bgcolor: u.role === 'ADMIN' ? '#EF444415' : '#3B82F615',
                          color: u.role === 'ADMIN' ? '#EF4444' : '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {u.nomUtilisateur.charAt(0).toUpperCase()}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                            {u.nomUtilisateur}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                            {u.role === 'ADMIN' && (
                              <Chip label="ADMIN" size="small" color="error" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                            )}
                            {!u.compteActif && (
                              <Chip label="inactif" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>
                    {filteredModules.map((m) => {
                      const cle = `${u.id}-${m.id}`;
                      const disabled = u.role === 'ADMIN' || enCoursId === cle;
                      const contenu = (
                        <Checkbox
                          checked={u.role === 'ADMIN' ? true : estCoche(u, m.id)}
                          disabled={disabled}
                          onChange={() => toggleModule(u, m.id)}
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                      );
                      return (
                        <TableCell key={m.id} align="center" sx={{ px: 1 }}>
                          {u.role === 'ADMIN' ? (
                            <Tooltip title="Les administrateurs ont accès à tous les modules">
                              <Box component="span">{contenu}</Box>
                            </Tooltip>
                          ) : (
                            contenu
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell 
                      align="center" 
                      sx={{ 
                        position: 'sticky', 
                        right: 0, 
                        zIndex: 2, 
                        bgcolor: 'background.paper',
                        minWidth: 120,
                        px: 1
                      }}
                    >
                      {u.role !== 'ADMIN' && (
                        <Stack direction="row" spacing={0.25} justifyContent="center">
                          <Tooltip title="Tout cocher">
                            <Button 
                              size="small" 
                              onClick={() => toutCocher(u.id)}
                              sx={{ minWidth: 32, p: 0.5 }}
                            >
                              <DoneAllIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Tout décocher">
                            <Button 
                              size="small" 
                              onClick={() => toutDecocher(u.id)}
                              sx={{ minWidth: 32, p: 0.5 }}
                            >
                              <DeselectIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Copier les permissions">
                            <Button 
                              size="small" 
                              onClick={() => openCopyDialog(u)}
                              sx={{ minWidth: 32, p: 0.5 }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Copy permissions dialog */}
        <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ pb: 2 }}>
            Copier les permissions de {utilisateurSource?.nomUtilisateur}
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sélectionnez les utilisateurs auxquels copier les mêmes modules :
            </Typography>
            <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filteredUsers
                .filter(u => u.id !== utilisateurSource?.id && u.role !== 'ADMIN')
                .map(u => (
                  <Button
                    key={u.id}
                    variant={utilisateursCibles.includes(u.id) ? 'contained' : 'outlined'}
                    onClick={() => {
                      setUtilisateursCibles(prev =>
                        prev.includes(u.id)
                          ? prev.filter(id => id !== u.id)
                          : [...prev, u.id]
                      );
                    }}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    <Checkbox checked={utilisateursCibles.includes(u.id)} size="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {u.nomUtilisateur}
                    </Typography>
                  </Button>
                ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCopyDialogOpen(false)} disabled={copyLoading}>
              Annuler
            </Button>
            <Button 
              onClick={copyPermissions} 
              variant="contained" 
              disabled={copyLoading || utilisateursCibles.length === 0}
              sx={{ borderRadius: 2 }}
            >
              {copyLoading ? 'Copie en cours...' : `Copier (${utilisateursCibles.length})`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default AdminPermissionsMatrixPage;

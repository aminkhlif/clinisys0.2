// src/pages/AdminPermissionsMatrixPage.jsx
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Tooltip, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Stack, CircularProgress, Paper, TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import { useSnackbar } from 'notistack';

// Memoized row component for performance
const PermissionRow = memo(({ 
  user, 
  filteredModules, 
  enCoursId, 
  toggleModule, 
  toutCocher, 
  toutDecocher, 
  openCopyDialog,
  estCoche
}) => {
  return (
    <TableRow hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
      <TableCell
        sx={{
          position: 'sticky',
          left: 0,
          zIndex: 2,
          bgcolor: 'background.paper',
          minWidth: 240,
          px: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            bgcolor: user.role === 'ADMIN' ? '#EF444415' : '#3B82F615',
            color: user.role === 'ADMIN' ? '#EF4444' : '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            {user.nomUtilisateur.charAt(0).toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {user.nomUtilisateur}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
              {user.role === 'ADMIN' && (
                <Chip label="ADMIN" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
              )}
              {!user.compteActif && (
                <Chip label="inactif" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
              )}
            </Stack>
          </Box>
        </Stack>
      </TableCell>
      {filteredModules.map((m) => {
        const cle = `${user.id}-${m.id}`;
        const disabled = user.role === 'ADMIN' || enCoursId === cle;
        const contenu = (
          <Checkbox
            checked={user.role === 'ADMIN' ? true : estCoche(user, m.id)}
            disabled={disabled}
            onChange={() => toggleModule(user, m.id)}
            size="medium"
            sx={{ p: 0.75 }}
          />
        );
        return (
          <TableCell key={m.id} align="center" sx={{ px: 1.5 }}>
            {user.role === 'ADMIN' ? (
              <Tooltip title="Les administrateurs ont accès à tous les modules">
                <Box component="span" sx={{ opacity: 0.5 }}>{contenu}</Box>
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
          minWidth: 140,
          px: 1.5
        }}
      >
        {user.role !== 'ADMIN' && (
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
            {enCoursId?.startsWith(`${user.id}-`) && (
              <CircularProgress size={20} sx={{ mr: 0.5 }} />
            )}
            <Tooltip title="Tout cocher">
              <Button 
                size="small" 
                onClick={() => toutCocher(user.id)}
                disabled={!!enCoursId?.startsWith(`${user.id}-`)}
                sx={{ minWidth: 36, p: 0.75, borderRadius: 1.5 }}
              >
                <DoneAllIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="Tout décocher">
              <Button 
                size="small" 
                onClick={() => toutDecocher(user.id)}
                disabled={!!enCoursId?.startsWith(`${user.id}-`)}
                sx={{ minWidth: 36, p: 0.75, borderRadius: 1.5 }}
              >
                <DeselectIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="Copier les permissions">
              <Button 
                size="small" 
                onClick={() => openCopyDialog(user)}
                disabled={!!enCoursId?.startsWith(`${user.id}-`)}
                sx={{ minWidth: 36, p: 0.75, borderRadius: 1.5 }}
              >
                <ContentCopyIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Stack>
        )}
      </TableCell>
    </TableRow>
  );
});

PermissionRow.displayName = 'PermissionRow';

function AdminPermissionsMatrixPage() {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rechercheUtilisateur, setRechercheUtilisateur] = useState('');
  const [rechercheModule, setRechercheModule] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  
  // Copy permissions dialog
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [utilisateurSource, setUtilisateurSource] = useState(null);
  const [utilisateursCibles, setUtilisateursCibles] = useState([]);
  const [copyLoading, setCopyLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [enCoursId, setEnCoursId] = useState(null);

  const loadMatrix = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/permissions/matrice');
      setMatrix(res.data);
    } catch (e) {
      console.error('Erreur loadMatrix:', e);
      enqueueSnackbar('Erreur lors du chargement de la matrice', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  // Client-side filtering with useMemo - MUST be before conditional returns
  const filteredUsers = useMemo(() => {
    if (!matrix?.utilisateurs) return [];
    return matrix.utilisateurs.filter(user => {
      const searchLower = rechercheUtilisateur.toLowerCase();
      return !searchLower || user.nomUtilisateur.toLowerCase().includes(searchLower);
    });
  }, [matrix?.utilisateurs, rechercheUtilisateur]);

  const filteredModules = useMemo(() => {
    if (!matrix?.tousModules) return [];
    return matrix.tousModules.filter(module => {
      const searchLower = rechercheModule.toLowerCase();
      return !searchLower || module.nom.toLowerCase().includes(searchLower);
    });
  }, [matrix?.tousModules, rechercheModule]);

  // Pagination - MUST be before conditional returns
  const paginatedUsers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const estCoche = useCallback((user, moduleId) => (user.modulesVisiblesIds || []).includes(moduleId), []);

  const toggleModule = useCallback(async (user, moduleId) => {
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
      enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' });
    } finally {
      setEnCoursId(null);
    }
  }, [enqueueSnackbar, estCoche]);

  const toutCocher = useCallback(async (userId) => {
    const user = matrix?.utilisateurs.find(u => u.id === userId);
    if (!user || user.role === 'ADMIN') return;
    
    setEnCoursId(`${userId}-all`);
    
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
    } finally {
      setEnCoursId(null);
    }
  }, [matrix?.utilisateurs, matrix?.tousModules, enqueueSnackbar]);

  const toutDecocher = useCallback(async (userId) => {
    const user = matrix?.utilisateurs.find(u => u.id === userId);
    if (!user || user.role === 'ADMIN') return;
    
    setEnCoursId(`${userId}-all`);
    
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
    } finally {
      setEnCoursId(null);
    }
  }, [matrix?.utilisateurs, enqueueSnackbar]);

  const openCopyDialog = useCallback((user) => {
    setUtilisateurSource(user);
    setUtilisateursCibles([]);
    setCopyDialogOpen(true);
  }, []);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Box>
      </AdminLayout>
    );
  }

  if (!matrix) {
    return (
      <AdminLayout>
        <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <Paper sx={{ p: 4, borderRadius: 2.5, textAlign: 'center' }}>
            <Typography color="text.secondary">Erreur lors du chargement des données.</Typography>
            <Button onClick={loadMatrix} sx={{ mt: 2 }}>Réessayer</Button>
          </Paper>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25 }}>Matrice des permissions</Typography>
          <Typography variant="body2" color="text.secondary">Gérer les accès aux modules par utilisateur</Typography>
        </Box>

        {/* Search bars */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {filteredUsers.length} utilisateurs × {filteredModules.length} modules
            </Typography>
          </Stack>
        </Paper>

        {filteredModules.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 2.5, textAlign: 'center' }}>
            <Typography color="text.secondary">Aucun module à afficher.</Typography>
          </Paper>
        ) : (
          <Box sx={{ mb: 3 }}>
            {/* Legend */}
            <Stack direction="row" spacing={3} sx={{ mb: 2, px: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Checkbox checked disabled size="small" sx={{ p: 0.5 }} />
                <Typography variant="caption" color="text.secondary">Accès autorisé</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Checkbox checked={false} disabled size="small" sx={{ p: 0.5 }} />
                <Typography variant="caption" color="text.secondary">Accès refusé</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Checkbox checked disabled size="small" sx={{ p: 0.5, opacity: 0.5 }} />
                <Typography variant="caption" color="text.secondary">Admin (tout accès)</Typography>
              </Stack>
            </Stack>

            <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
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
                        minWidth: 240,
                        px: 2,
                      }}
                    >
                      Utilisateur
                    </TableCell>
                    {filteredModules.map((m) => (
                      <TableCell key={m.id} align="center" sx={{ fontWeight: 700, minWidth: 100, px: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
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
                        minWidth: 140,
                        px: 1.5
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((u) => (
                    <PermissionRow
                      key={u.id}
                      user={u}
                      filteredModules={filteredModules}
                      enCoursId={enCoursId}
                      toggleModule={toggleModule}
                      toutCocher={toutCocher}
                      toutDecocher={toutDecocher}
                      openCopyDialog={openCopyDialog}
                      estCoche={estCoche}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />
          </Box>
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

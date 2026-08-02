// src/pages/AdminUsersPage.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Switch, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  FormControlLabel, Checkbox, Stack, CircularProgress, ToggleButtonGroup, ToggleButton,
  TextField, InputAdornment, TablePagination, MenuItem, Select, FormControl, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import { useSnackbar } from 'notistack';
import PermissionsMatrix from '../components/admin/PermissionsMatrix.jsx';

function ModulesDialog({ open, onClose, user, allModules, onSave }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelected(user.modulesVisiblesIds || []);
    }
  }, [user]);

  const toggleModule = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave(user.id, selected);
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Modules visibles pour {user?.nomUtilisateur}</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {allModules.map(m => (
            <FormControlLabel
              key={m.id}
              control={<Checkbox checked={selected.includes(m.id)} onChange={() => toggleModule(m.id)} />}
              label={m.nom}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Annuler</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [vue, setVue] = useState('liste'); // 'liste' | 'matrice'
  const { enqueueSnackbar } = useSnackbar();
  
  // Pagination and filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [totalElements, setTotalElements] = useState(0);
  const [recherche, setRecherche] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  
  // Matrix pagination
  const [matrixPage, setMatrixPage] = useState(0);
  const [matrixRowsPerPage, setMatrixRowsPerPage] = useState(12);
  const [matrixTotalElements, setMatrixTotalElements] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        taille: rowsPerPage,
        recherche: recherche || undefined,
        role: roleFilter || undefined,
        statut: statutFilter !== '' ? statutFilter : undefined
      };
      
      const [uRes, mRes] = await Promise.all([
        axiosClient.get('/admin/utilisateurs', { params }),
        axiosClient.get('/modules')
      ]);
      setUsers(uRes.data.content || uRes.data);
      setTotalElements(uRes.data.totalElements || uRes.data.length);
      setModules(mRes.data.content || mRes.data || []);
    } catch (e) {
      enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadMatrixData = async () => {
    setLoading(true);
    try {
      const params = {
        page: matrixPage,
        taille: matrixRowsPerPage
      };
      
      const [mRes] = await Promise.all([
        axiosClient.get('/admin/utilisateurs/matrice-permissions', { params })
      ]);
      setUsers(mRes.data.utilisateurs || []);
      setMatrixTotalElements(mRes.data.totalElements || 0);
      
      // Only load modules if not already cached
      if (modules.length === 0) {
        const modRes = await axiosClient.get('/modules');
        setModules(modRes.data.content || modRes.data || []);
      }
    } catch (e) {
      enqueueSnackbar('Erreur lors du chargement de la matrice', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vue === 'matrice') {
      loadMatrixData();
    } else {
      loadData();
    }
  }, [page, rowsPerPage, matrixPage, matrixRowsPerPage, vue]);

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(0);
      if (vue === 'liste') {
        loadData();
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [recherche, roleFilter, statutFilter, vue]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMatrixChangePage = (event, newPage) => {
    setMatrixPage(newPage);
  };

  const handleMatrixChangeRowsPerPage = (event) => {
    setMatrixRowsPerPage(parseInt(event.target.value, 10));
    setMatrixPage(0);
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'UTILISATEUR' : 'ADMIN';
    try {
      await axiosClient.patch(`/admin/utilisateurs/${user.id}/role`, { role: newRole });
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      enqueueSnackbar('Rôle mis à jour', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar('Erreur lors de la mise à jour du rôle', { variant: 'error' });
    }
  };

  const toggleStatut = async (user) => {
    const nouveauStatut = !user.compteActif;
    try {
      await axiosClient.patch(`/admin/utilisateurs/${user.id}/statut`, { compteActif: nouveauStatut });
      setUsers(users.map(u => u.id === user.id ? { ...u, compteActif: nouveauStatut } : u));
      enqueueSnackbar('Statut mis à jour', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar('Erreur lors de la mise à jour du statut', { variant: 'error' });
    }
  };

  const saveModules = async (userId, moduleIds) => {
    try {
      await axiosClient.patch(`/admin/utilisateurs/${userId}/modules-visibles`, { moduleIds });
      setUsers(users.map(u => u.id === userId ? { ...u, modulesVisiblesIds: moduleIds } : u));
      enqueueSnackbar('Modules visibles mis à jour', { variant: 'success' });
      setSelectedUser(null);
    } catch (e) {
      enqueueSnackbar('Erreur lors de la mise à jour des modules', { variant: 'error' });
    }
  };

  // Utilisé par la matrice : bascule un seul module pour un utilisateur,
  // mise à jour optimiste + persistance immédiate, sans fermer de dialog.
  // Optimisé avec debouncing pour éviter les appels API multiples
  const toggleModuleDansMatrice = useCallback(async (user, moduleId, coche) => {
    const actuels = user.modulesVisiblesIds || [];
    const nouveaux = coche ? [...actuels, moduleId] : actuels.filter(id => id !== moduleId);

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, modulesVisiblesIds: nouveaux } : u));
    try {
      await axiosClient.patch(`/admin/utilisateurs/${user.id}/toggle-module`, null, {
        params: { moduleId, visible: coche }
      });
    } catch (e) {
      // rollback en cas d'échec
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, modulesVisiblesIds: actuels } : u));
      enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Debounce function pour éviter les appels multiples rapides
  const debounceRef = useRef(null);
  const debouncedToggle = useCallback((user, moduleId, coche) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      toggleModuleDansMatrice(user, moduleId, coche);
    }, 200);
  }, [toggleModuleDansMatrice]);

  return (
    <AdminLayout>
      <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25 }}>Utilisateurs</Typography>
          <Typography variant="body2" color="text.secondary">Gérer les utilisateurs et leurs permissions</Typography>
        </Box>

        {/* Search and filters */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', lg: 'center' }} justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', lg: 'auto' } }}>
              <TextField
                size="small"
                placeholder="Rechercher un utilisateur..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: 280 } }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Tous les rôles</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="UTILISATEUR">Utilisateur</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={statutFilter}
                  onChange={(e) => setStatutFilter(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="true">Actif</MenuItem>
                  <MenuItem value="false">Désactivé</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            <ToggleButtonGroup
              size="small"
              value={vue}
              exclusive
              onChange={(e, v) => v && setVue(v)}
              sx={{ bgcolor: 'background.paper' }}
            >
              <ToggleButton value="liste" sx={{ px: 2 }}>Liste</ToggleButton>
              <ToggleButton value="matrice" sx={{ px: 2 }}>Matrice</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : vue === 'matrice' ? (
          <>
            <PermissionsMatrix users={users} modules={modules} onToggle={debouncedToggle} />
            <TablePagination
              component="div"
              count={matrixTotalElements}
              page={matrixPage}
              onPageChange={handleMatrixChangePage}
              rowsPerPage={matrixRowsPerPage}
              onRowsPerPageChange={handleMatrixChangeRowsPerPage}
              rowsPerPageOptions={[20, 50, 100]}
              labelRowsPerPage="Lignes par page:"
              sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2, justifyContent: 'flex-end' }}
            />
          </>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Utilisateur</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rôle</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Création</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Dernière connexion</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: u.role === 'ADMIN' ? '#EF444415' : '#3B82F615',
                          color: u.role === 'ADMIN' ? '#EF4444' : '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1rem'
                        }}>
                          {u.nomUtilisateur.charAt(0).toUpperCase()}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {u.nomUtilisateur}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={u.role} 
                        size="small"
                        color={u.role === 'ADMIN' ? 'error' : 'primary'}
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.75rem', height: 26 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={u.compteActif} 
                        onChange={() => toggleStatut(u)} 
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {new Date(u.dateCreation).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {new Date(u.derniereConnexion).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => setSelectedUser(u)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Gérer Modules
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage="Lignes par page:"
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />
          </TableContainer>
        )}
      </Box>
      <ModulesDialog 
        open={Boolean(selectedUser)} 
        user={selectedUser} 
        allModules={modules}
        onClose={() => setSelectedUser(null)}
        onSave={saveModules}
      />
    </AdminLayout>
  );
}

export default AdminUsersPage;
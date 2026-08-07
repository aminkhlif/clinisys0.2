// src/pages/AdminUsersPage.jsx
import { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Switch, Stack, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, TablePagination, MenuItem, Select, FormControl, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import { useSnackbar } from 'notistack';


function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  // Pagination and filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [recherche, setRecherche] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  

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


  useEffect(() => {
    loadData();
  }, [page, rowsPerPage]);

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(0);
      loadData();
    }, 300);
    return () => clearTimeout(delay);
  }, [recherche, roleFilter, statutFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axiosClient.delete(`/admin/utilisateurs/${deleteConfirmation.id}`);
      await loadData();
      enqueueSnackbar('Utilisateur supprimé', { variant: 'success' });
      setDeleteConfirmation(null);
    } catch (e) {
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };



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
            
          </Stack>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
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
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteConfirmation(u)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Supprimer
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
      
      <Dialog open={Boolean(deleteConfirmation)} onClose={() => setDeleteConfirmation(null)}>
        <DialogTitle>Supprimer l'utilisateur ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{deleteConfirmation?.nomUtilisateur}</strong> ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation(null)} disabled={deleting}>
            Annuler
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminUsersPage;
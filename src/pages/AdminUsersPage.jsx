// src/pages/AdminUsersPage.jsx
import { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Switch, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  FormControlLabel, Checkbox, Stack, CircularProgress, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import { useSnackbar } from 'notistack';
import AdminNav from '../components/admin/AdminNav.jsx';
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, mRes] = await Promise.all([
        axiosClient.get('/admin/utilisateurs'),
        axiosClient.get('/modules')
      ]);
      setUsers(uRes.data);
      setModules(mRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'UTILISATEUR' : 'ADMIN';
    try {
      await axiosClient.patch(`/admin/utilisateurs/${user.id}/role`, { role: newRole });
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      enqueueSnackbar('Rôle mis à jour', { variant: 'success' });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatut = async (user) => {
    const nouveauStatut = !user.compteActif;
    try {
      await axiosClient.patch(`/admin/utilisateurs/${user.id}/statut`, { compteActif: nouveauStatut });
      setUsers(users.map(u => u.id === user.id ? { ...u, compteActif: nouveauStatut } : u));
      enqueueSnackbar('Statut mis à jour', { variant: 'success' });
    } catch (e) {
      console.error(e);
    }
  };

  const saveModules = async (userId, moduleIds) => {
    try {
      await axiosClient.patch(`/admin/utilisateurs/${userId}/modules-visibles`, { moduleIds });
      setUsers(users.map(u => u.id === userId ? { ...u, modulesVisiblesIds: moduleIds } : u));
      enqueueSnackbar('Modules visibles mis à jour', { variant: 'success' });
      setSelectedUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Utilisé par la matrice : bascule un seul module pour un utilisateur,
  // mise à jour optimiste + persistance immédiate, sans fermer de dialog.
  const toggleModuleDansMatrice = async (user, moduleId, coche) => {
    const actuels = user.modulesVisiblesIds || [];
    const nouveaux = coche ? [...actuels, moduleId] : actuels.filter(id => id !== moduleId);

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, modulesVisiblesIds: nouveaux } : u));
    try {
      await axiosClient.patch(`/admin/utilisateurs/${user.id}/modules-visibles`, { moduleIds: nouveaux });
    } catch (e) {
      // rollback en cas d'échec
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, modulesVisiblesIds: actuels } : u));
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ pb: 6 }}>
        
        <AdminNav />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ToggleButtonGroup
            size="small"
            value={vue}
            exclusive
            onChange={(e, v) => v && setVue(v)}
          >
            <ToggleButton value="liste">Liste</ToggleButton>
            <ToggleButton value="matrice">Matrice des permissions</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : vue === 'matrice' ? (
          <PermissionsMatrix users={users} modules={modules} onToggle={toggleModuleDansMatrice} />
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead >
                <TableRow>
                  <TableCell>Nom d'utilisateur</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Actif</TableCell>
                  <TableCell>Création</TableCell>
                  <TableCell>Dernière connexion</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nomUtilisateur}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color={u.role === 'ADMIN' ? 'error' : 'primary'} onClick={() => toggleRole(u)}>
                        {u.role}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Switch checked={u.compteActif} onChange={() => toggleStatut(u)} color="success" />
                    </TableCell>
                    <TableCell>{new Date(u.dateCreation).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(u.derniereConnexion).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => setSelectedUser(u)}>Gérer Modules</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
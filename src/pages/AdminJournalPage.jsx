// src/pages/AdminJournalPage.jsx
import { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, TablePagination, TextField, InputAdornment, Stack, MenuItem, Select, FormControl, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import { useSnackbar } from 'notistack';

function AdminJournalPage() {
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [totalElements, setTotalElements] = useState(0);
  const [typeActionFilter, setTypeActionFilter] = useState('');
  const [nomUtilisateurFilter, setNomUtilisateurFilter] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const loadJournal = async (p, size) => {
    setLoading(true);
    try {
      const params = {
        page: p,
        taille: size,
        typeAction: typeActionFilter || undefined,
        nomUtilisateur: nomUtilisateurFilter || undefined
      };
      const res = await axiosClient.get('/admin/journal', { params });
      setJournal(res.data.content);
      setTotalElements(res.data.totalElements);
    } catch (e) {
      enqueueSnackbar('Erreur lors du chargement du journal', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournal(page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Debounce filters
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(0);
      loadJournal(0, rowsPerPage);
    }, 300);
    return () => clearTimeout(delay);
  }, [typeActionFilter, nomUtilisateurFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <AdminLayout>
      <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.25 }}>Journal d'audit</Typography>
          <Typography variant="body2" color="text.secondary">Historique des actions et modifications</Typography>
        </Box>
        
        {/* Filters */}
        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Filtrer par utilisateur..."
              value={nomUtilisateurFilter}
              onChange={(e) => setNomUtilisateurFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 280 } }}
            />
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                value={typeActionFilter}
                onChange={(e) => setTypeActionFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Toutes les actions</MenuItem>
                <MenuItem value="CREATION_MODULE">Création module</MenuItem>
                <MenuItem value="MODIFICATION_MODULE">Modification module</MenuItem>
                <MenuItem value="SUPPRESSION_MODULE">Suppression module</MenuItem>
                <MenuItem value="CREATION_UTILISATEUR">Création utilisateur</MenuItem>
                <MenuItem value="MODIFICATION_UTILISATEUR">Modification utilisateur</MenuItem>
                <MenuItem value="MODIFICATION_PERMISSION">Modification permission</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date/Heure</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Détail</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Utilisateur</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : journal.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary">Aucun événement enregistré</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                journal.map(j => (
                  <TableRow key={j.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {new Date(j.dateAction).toLocaleString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={j.action} 
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.75rem',
                          bgcolor: 'action.hover',
                          height: 26
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{j.cible}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          {j.nomUtilisateur?.charAt(0).toUpperCase() || '?'}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {j.nomUtilisateur}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
      </Box>
    </AdminLayout>
  );
}

export default AdminJournalPage;

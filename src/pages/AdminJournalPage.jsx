// src/pages/AdminJournalPage.jsx
import { useEffect, useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, TablePagination 
} from '@mui/material';
import axiosClient from '../api/axiosClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import AdminNav from '../components/admin/AdminNav.jsx';

function AdminJournalPage() {
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const loadJournal = async (p, size) => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/journal', { params: { page: p, taille: size } });
      setJournal(res.data.content);
      setTotalElements(res.data.totalElements);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournal(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <AdminLayout>
      <Box sx={{ pb: 6 }}>
        
        <AdminNav />
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead >
              <TableRow>
                <TableCell>Date/Heure</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Détail</TableCell>
                <TableCell>Utilisateur</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : journal.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Aucun événement enregistré</TableCell>
                </TableRow>
              ) : (
                journal.map(j => (
                  <TableRow key={j.id}>
                    <TableCell>{new Date(j.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{j.action}</TableCell>
                    <TableCell>{j.detail}</TableCell>
                    <TableCell>{j.userId}</TableCell>
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
          />
        </TableContainer>
      </Box>
    </AdminLayout>
  );
}

export default AdminJournalPage;

// src/components/auth/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext.jsx';

function AdminRoute({ children }) {
  const { estAuthentifie, estAdmin, chargementInitial } = useAuth();

  if (chargementInitial) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!estAuthentifie) {
    return <Navigate to="/login" replace />;
  }

  if (!estAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;

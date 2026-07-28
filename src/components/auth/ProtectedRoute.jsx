// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { estAuthentifie, chargementInitial } = useAuth();
  const location = useLocation();

  if (chargementInitial) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} sx={{ color: 'grey.900' }} />
      </Box>
    );
  }

  if (!estAuthentifie) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
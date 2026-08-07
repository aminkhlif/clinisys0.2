// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import MainLayout from './components/layout/MainLayout.jsx';
import ModulesPage from './pages/ModulesPage.jsx';
import SousMenuPage from './pages/SousMenuPage.jsx';
import VideoEditPage from './pages/VideoEditPage.jsx';
import ImageEditPage from './pages/ImageEditPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminJournalPage from './pages/AdminJournalPage.jsx';
import AdminPermissionsMatrixPage from './pages/AdminPermissionsMatrixPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';

function AccueilPage() {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1,
      }}
    >
      <Typography variant="h6" sx={{ color: 'text.primary' }}>
        Aucun sous-menu sélectionné
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
        Choisissez un sous-menu dans le panneau latéral pour afficher et gérer ses captures d'écran.
      </Typography>
    </Box>
  );
}

// Wrapper affiché pour un module donné : sidebar + routes internes (accueil / sous-menu)
function ModuleShell() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<AccueilPage />} />
        <Route path="sous-menus/:sousMenuId" element={<SousMenuPage />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Toutes les autres routes exigent d'être authentifié */}
        <Route path="/" element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
        <Route
          path="/modules/:moduleId/sous-menus/:sousMenuId/images/:imageId"
          element={<ProtectedRoute><ImageEditPage /></ProtectedRoute>}
        />
        <Route
          path="/modules/:moduleId/sous-menus/:sousMenuId/video"
          element={<ProtectedRoute><VideoEditPage /></ProtectedRoute>}
        />
        <Route path="/modules/:moduleId/*" element={<ProtectedRoute><ModuleShell /></ProtectedRoute>} />

        {/* Routes d'administration */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/utilisateurs" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/permissions" element={<AdminRoute><AdminPermissionsMatrixPage /></AdminRoute>} />
        <Route path="/admin/journal" element={<AdminRoute><AdminJournalPage /></AdminRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
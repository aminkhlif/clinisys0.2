// src/components/auth/UserMenu.jsx
import { useState } from 'react';
import { Stack, Typography, IconButton, Tooltip, Avatar, ButtonBase, Menu, MenuItem } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAppTheme } from '../../context/ThemeContext.jsx';
import ChangePasswordDialog from './ChangePasswordDialog.jsx';
import ChangeUsernameDialog from './ChangeUsernameDialog.jsx';

function UserMenu({ variant: forceVariant }) {
  const { utilisateur, estAdmin, deconnecter } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [dialogMotDePasseOuvert, setDialogMotDePasseOuvert] = useState(false);
  const [dialogNomUtilisateurOuvert, setDialogNomUtilisateurOuvert] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const gererDeconnexion = async () => {
    await deconnecter();
    enqueueSnackbar('Vous avez été déconnecté', { variant: 'success' });
    navigate('/login', { replace: true });
  };

  const { mode } = useAppTheme();
  const estSombre = forceVariant ? forceVariant === 'dark' : mode === 'dark';

  if (!utilisateur) return null;

  const initiale = utilisateur.nomUtilisateur.charAt(0).toUpperCase();

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {estAdmin && (
        <Tooltip title="Administration">
          <IconButton
            size="small"
            onClick={() => navigate('/admin')}
            sx={{
              color: estSombre ? 'rgba(255,255,255,0.6)' : 'text.secondary',
              '&:hover': {
                bgcolor: estSombre ? 'rgba(255,255,255,0.1)' : 'action.hover',
                color: estSombre ? 'background.paper' : 'text.primary',
              },
            }}
          >
            <AdminPanelSettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <ButtonBase
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        sx={{
          pl: 0.5,
          pr: 1.5,
          py: 0.5,
          borderRadius: 999,
          bgcolor: estSombre ? 'rgba(255,255,255,0.08)' : 'action.hover',
          gap: 1,
          transition: 'background-color 140ms ease',
          '&:hover': { bgcolor: estSombre ? 'rgba(255,255,255,0.14)' : 'grey.150' },
        }}
      >
        <Avatar
          sx={{
            width: 26,
            height: 26,
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'background.paper',
          }}
        >
          {initiale}
        </Avatar>
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: estSombre ? 'rgba(255,255,255,0.9)' : 'text.primary',
          }}
        >
          {utilisateur.nomUtilisateur}
        </Typography>
      </ButtonBase>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
      >
        <MenuItem onClick={() => { setMenuAnchor(null); setDialogNomUtilisateurOuvert(true); }}>
          <PersonOutlineOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
          Changer mon nom
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); setDialogMotDePasseOuvert(true); }}>
          <LockOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
          Changer mon mot de passe
        </MenuItem>
      </Menu>

      <Tooltip title="Déconnexion">
        <IconButton
          size="small"
          onClick={gererDeconnexion}
          sx={{
            color: estSombre ? 'rgba(255,255,255,0.6)' : 'text.secondary',
            '&:hover': {
              bgcolor: estSombre ? 'rgba(255,255,255,0.1)' : 'action.hover',
              color: estSombre ? 'background.paper' : 'text.primary',
            },
          }}
        >
          <LogoutOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <ChangePasswordDialog
        ouvert={dialogMotDePasseOuvert}
        onFermer={() => setDialogMotDePasseOuvert(false)}
      />
      <ChangeUsernameDialog
        ouvert={dialogNomUtilisateurOuvert}
        onFermer={() => setDialogNomUtilisateurOuvert(false)}
      />
    </Stack>
  );
}

export default UserMenu;
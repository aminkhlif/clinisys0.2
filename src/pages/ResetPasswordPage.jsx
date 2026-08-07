// src/pages/ResetPasswordPage.jsx
import { useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Link, Stack, IconButton, InputAdornment } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useAuth } from '../context/AuthContext.jsx';
import { dotGridBackgroundSx } from '../theme/backgrounds.js';

function ResetPasswordPage() {
  const { reinitialiserMotDePasse } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    if (!token) {
      setErreur('Token de réinitialisation manquant');
      return;
    }
    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (confirmationMotDePasse !== motDePasse) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }
    setEnCours(true);
    setErreur('');
    try {
      await reinitialiserMotDePasse(token, motDePasse);
      navigate('/login', { replace: true });
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...dotGridBackgroundSx,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 380,
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 3.5 }}>
          <Box component="svg" viewBox="0 0 32 32" sx={{ width: 40, height: 40 }}>
            <g transform="translate(16 16)">
              <g>
                <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.5s" repeatCount="indefinite" />
                <path d="M-3 -11 H3 V-3 H11 V3 H3 V11 H-3 V3 H-11 V-3 H-3 Z" fill="#000000" opacity="0.15" />
                <path d="M-8 0 L-4 0 L-2 -3 L1 5 L3.5 -2 L5 0 L8 0" fill="none" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
            <circle cx="16" cy="16" r="14" fill="none" stroke="#000000" strokeWidth="1.5" strokeDasharray="20 10 5 10" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="10s" repeatCount="indefinite" />
            </circle>
          </Box>
          <Typography variant="h5">Réinitialiser le mot de passe</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Entrez votre nouveau mot de passe
          </Typography>
        </Stack>

        <Box component="form" onSubmit={soumettre} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Nouveau mot de passe"
              type={motDePasseVisible ? 'text' : 'password'}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              error={Boolean(erreur)}
              helperText={erreur}
              autoComplete="new-password"
              autoFocus
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setMotDePasseVisible((v) => !v)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {motDePasseVisible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirmer le mot de passe"
              type="password"
              value={confirmationMotDePasse}
              onChange={(e) => setConfirmationMotDePasse(e.target.value)}
              autoComplete="new-password"
              fullWidth
            />
            <Button type="submit" variant="contained" fullWidth disabled={enCours} sx={{ py: 1.2 }}>
              {enCours ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 3 }}>
          <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Retour à la connexion
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default ResetPasswordPage;

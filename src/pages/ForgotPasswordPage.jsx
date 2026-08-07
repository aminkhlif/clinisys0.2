// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Link, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { dotGridBackgroundSx } from '../theme/backgrounds.js';

function ForgotPasswordPage() {
  const { demanderResetMotDePasse } = useAuth();

  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErreur('Veuillez renseigner votre email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErreur('Format d\'email invalide');
      return;
    }
    setEnCours(true);
    setErreur('');
    try {
      await demanderResetMotDePasse(email.trim());
      setSucces(true);
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
          <Typography variant="h5">Mot de passe oublié</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Entrez votre email pour recevoir un lien de réinitialisation
          </Typography>
        </Stack>

        {!succes ? (
          <Box component="form" onSubmit={soumettre} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(erreur)}
                helperText={erreur}
                autoComplete="email"
                autoFocus
                fullWidth
              />
              <Button type="submit" variant="contained" fullWidth disabled={enCours} sx={{ py: 1.2 }}>
                {enCours ? 'Envoi…' : 'Envoyer le lien'}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" sx={{ color: 'success.main', mb: 2 }}>
              Un email de réinitialisation a été envoyé à {email}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Vérifiez votre boîte de réception et suivez les instructions.
            </Typography>
          </Box>
        )}

        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 3 }}>
          <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Retour à la connexion
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default ForgotPasswordPage;

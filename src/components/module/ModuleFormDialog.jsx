// src/components/module/ModuleFormDialog.jsx
import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import axiosClient from '../../api/axiosClient.js';

function ModuleFormDialog({ ouvert, module, onFermer, onSauvegarde }) {
  const [nom, setNom] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);
  const inputRef = useRef(null);
  const isEdition = Boolean(module);

  // Reset du formulaire à l'ouverture ou quand le module change
  useEffect(() => {
    console.log('Module reçu dans useEffect:', module);
    setNom(module?.nom || '');
    setErreur('');
    // focus only after dialog is open
    if (ouvert) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [module, ouvert]);

  // Empêche la fermeture du dialog pendant l'enregistrement
  const handleClose = () => {
    if (enCours) return;
    onFermer();
  };

  // Validation simple et envoi
  const sauvegarder = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (enCours) return;
    const trimmed = nom.trim();
    console.log('Tentative sauvegarde - isEdition:', isEdition, 'nom original:', nom, 'nom trimmed:', trimmed);
    if (!trimmed) {
      setErreur('Le nom est obligatoire');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > 120) {
      setErreur('Le nom est trop long');
      inputRef.current?.focus();
      return;
    }

    setEnCours(true);
    setErreur('');
    try {
      if (isEdition) {
        console.log('Modification module:', module.id, 'nouveau nom:', trimmed);
        const res = await axiosClient.put(`/modules/${module.id}`, { nom: trimmed });
        console.log('Réponse modification:', res.data);
        onSauvegarde(res?.data || module);
      } else {
        console.log('Création module:', trimmed);
        const res = await axiosClient.post('/modules', { nom: trimmed });
        console.log('Réponse création:', res.data);
        onSauvegarde(res?.data);
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      console.error('Response data:', err?.response?.data);
      console.error('Response status:', err?.response?.status);
      // Lecture prudente du message d'erreur renvoyé par l'API
      const serverMessage = err?.response?.data?.message || err?.response?.data?.nom || null;
      setErreur(serverMessage || 'Une erreur est survenue. Réessayez.');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <Dialog
      open={ouvert}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="module-form-title"
      disableEscapeKeyDown={enCours}
    >
      <form onSubmit={sauvegarder} noValidate>
        <DialogTitle id="module-form-title">
          {isEdition ? 'Modifier le module' : 'Nouveau module'}
        </DialogTitle>

        <DialogContent>
          <TextField
            inputRef={inputRef}
            autoFocus
            fullWidth
            margin="dense"
            label="Nom du module"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && !enCours) onFermer();
            }}
            error={Boolean(erreur)}
            helperText={erreur || 'Choisissez un nom clair et descriptif'}
            inputProps={{ maxLength: 120, 'aria-label': 'Nom du module' }}
            disabled={enCours}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={enCours} aria-label="Annuler">
            Annuler
          </Button>

          <Box sx={{ position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={enCours}
              aria-label={enCours ? 'Enregistrement en cours' : 'Enregistrer le module'}
            >
              {isEdition ? 'Enregistrer les modifications' : 'Enregistrer'}
            </Button>

            {enCours && (
              <CircularProgress
                size={20}
                sx={{
                  color: 'primary.main',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-10px',
                  marginLeft: '-10px',
                }}
                aria-hidden="true"
              />
            )}
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ModuleFormDialog;

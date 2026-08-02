// src/components/admin/PermissionsMatrix.jsx
import { useState, memo } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Tooltip, Typography, Chip
} from '@mui/material';

// Grille visuelle : une ligne par utilisateur, une colonne par module.
// Cocher/décocher une case appelle immédiatement onToggle(userId, moduleId, checked)
// pour une mise à jour optimiste + persistance backend.
const PermissionsMatrix = memo(function PermissionsMatrix({ users, modules, onToggle }) {
  const [enCoursId, setEnCoursId] = useState(null); // "userId-moduleId" en attente de réponse serveur

  const estCoche = (user, moduleId) => (user.modulesVisiblesIds || []).includes(moduleId);

  const handleClick = async (user, moduleId) => {
    if (user.role === 'ADMIN') return; // les admins voient tout, rien à cocher
    const cle = `${user.id}-${moduleId}`;
    const coche = estCoche(user, moduleId);
    setEnCoursId(cle);
    try {
      await onToggle(user, moduleId, !coche);
    } finally {
      setEnCoursId(null);
    }
  };

  if (modules.length === 0) {
    return <Typography color="text.secondary">Aucun module à afficher.</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'auto' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 3,
                bgcolor: 'background.paper',
                fontWeight: 700,
                minWidth: 180,
              }}
            >
              Utilisateur
            </TableCell>
            {modules.map((m) => (
              <TableCell key={m.id} align="center" sx={{ fontWeight: 700, minWidth: 110 }}>
                {m.nom}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} hover>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {u.nomUtilisateur}
                {u.role === 'ADMIN' && (
                  <Chip label="ADMIN" size="small" color="error" variant="outlined" />
                )}
                {!u.compteActif && (
                  <Chip label="désactivé" size="small" variant="outlined" />
                )}
              </TableCell>
              {modules.map((m) => {
                const cle = `${u.id}-${m.id}`;
                const disabled = u.role === 'ADMIN' || enCoursId === cle;
                const contenu = (
                  <Checkbox
                    checked={u.role === 'ADMIN' ? true : estCoche(u, m.id)}
                    disabled={disabled}
                    onChange={() => handleClick(u, m.id)}
                  />
                );
                return (
                  <TableCell key={m.id} align="center">
                    {u.role === 'ADMIN' ? (
                      <Tooltip title="Les administrateurs ont accès à tous les modules">
                        <Box component="span">{contenu}</Box>
                      </Tooltip>
                    ) : (
                      contenu
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default PermissionsMatrix;
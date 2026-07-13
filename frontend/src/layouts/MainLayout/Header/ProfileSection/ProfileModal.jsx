import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';

import useAuth from 'hooks/useAuth';
import resizeImage from 'utils/resizeImage';

export default function ProfileModal({ open, onClose }) {
  const { user, updateProfile } = useAuth();
  const fileRef = useRef(null);

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(user?.name ?? '');
      setAvatar(user?.avatar ?? null);
      setError('');
    }
  }, [open, user]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      setAvatar(await resizeImage(file));
    } catch (err) {
      setError(err.message ?? 'No se pudo procesar la imagen');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('El nombre no puede estar vacío'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      await updateProfile({ name: name.trim(), avatar });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo guardar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Mi perfil</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} alignItems="center" sx={{ pt: 1 }}>
          <Avatar src={avatar || undefined} sx={{ width: 96, height: 96, fontSize: 32 }}>
            {(name || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<PhotoCameraOutlinedIcon />} onClick={() => fileRef.current?.click()}>
              Cambiar imagen
            </Button>
            {avatar && (
              <Button size="small" color="error" onClick={() => setAvatar(null)}>Quitar</Button>
            )}
          </Stack>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

          <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-start' }}>
            {user?.email} · {user?.role}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

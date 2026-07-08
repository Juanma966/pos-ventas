import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import formatCurrency from 'utils/formatCurrency';

export default function CloseSessionModal({ open, expected, onClose, onSubmit, isSubmitting, error }) {
  const [counted, setCounted] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setCounted('');
      setNotes('');
    }
  }, [open]);

  const countedNum = Number(counted) || 0;
  const difference = Number((countedNum - expected).toFixed(2));
  const hasCounted = counted !== '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Cerrar caja — Arqueo</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Efectivo esperado</Typography>
            <Typography fontWeight={600}>{formatCurrency(expected)}</Typography>
          </Box>
          <TextField
            label="Efectivo contado"
            type="number"
            value={counted}
            onChange={(e) => setCounted(e.target.value)}
            fullWidth
            autoFocus
            inputProps={{ min: 0, step: 50 }}
          />
          {hasCounted && (
            <>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5">Diferencia</Typography>
                <Typography variant="h5" color={difference === 0 ? 'success.main' : 'error.main'}>
                  {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                </Typography>
              </Box>
            </>
          )}
          <TextField
            label="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => onSubmit({ countedAmount: countedNum, notes: notes.trim() || undefined })}
          disabled={!hasCounted || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          Cerrar caja
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CloseSessionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  expected: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
};

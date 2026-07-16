import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

import MainCard from 'components/cards/MainCard';
import useCash from 'hooks/useCash';
import useNotification from 'hooks/useNotification';
import { cashService } from 'services/cashService';
import formatCurrency from 'utils/formatCurrency';
import SessionSummary from './components/SessionSummary';
import MovementsTable from './components/MovementsTable';
import MovementFormModal from './components/MovementFormModal';
import CloseSessionModal from './components/CloseSessionModal';

export default function CashPage() {
  const { session, isOpen, isLoading, mutate } = useCash();
  const { notify } = useNotification();

  const [openingAmount, setOpeningAmount] = useState('');
  const [isOpening, setIsOpening] = useState(false);

  const [movementOpen, setMovementOpen] = useState(false);
  const [isSubmittingMovement, setIsSubmittingMovement] = useState(false);
  const [movementError, setMovementError] = useState('');

  const [closeOpen, setCloseOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState('');

  const handleOpenSession = async () => {
    setIsOpening(true);
    try {
      await cashService.open({ openingAmount: Number(openingAmount) || 0 });
      setOpeningAmount('');
      await mutate();
      notify.success('Caja abierta');
    } catch (err) {
      notify.error(err.response?.data?.message ?? 'No se pudo abrir la caja');
    } finally {
      setIsOpening(false);
    }
  };

  const handleAddMovement = async (payload) => {
    setIsSubmittingMovement(true);
    setMovementError('');
    try {
      await cashService.addMovement(payload);
      await mutate();
      setMovementOpen(false);
      notify.success('Movimiento registrado');
    } catch (err) {
      setMovementError(err.response?.data?.message ?? 'No se pudo registrar el movimiento');
    } finally {
      setIsSubmittingMovement(false);
    }
  };

  const handleClose = async (payload) => {
    setIsClosing(true);
    setCloseError('');
    try {
      const closed = await cashService.close(payload);
      await mutate();
      setCloseOpen(false);
      const diff = Number(closed.difference);
      const diffMsg = diff === 0 ? 'sin diferencia' : `diferencia ${diff > 0 ? '+' : ''}${formatCurrency(diff)}`;
      const message = `Caja cerrada — ${diffMsg}`;
      if (diff === 0) notify.success(message);
      else notify.warning(message);
    } catch (err) {
      setCloseError(err.response?.data?.message ?? 'No se pudo cerrar la caja');
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <MainCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <>
      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h3">Caja</Typography>
          {isOpen && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setMovementError('');
                  setMovementOpen(true);
                }}
              >
                Registrar movimiento
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<LockOutlinedIcon />}
                onClick={() => {
                  setCloseError('');
                  setCloseOpen(true);
                }}
              >
                Cerrar caja
              </Button>
            </Stack>
          )}
        </Stack>

        {!isOpen ? (
          <Box sx={{ py: 4, maxWidth: 360, mx: 'auto', textAlign: 'center' }}>
            <PointOfSaleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              No hay una caja abierta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ingresá el monto inicial en efectivo para abrir la caja.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Monto de apertura"
                type="number"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                fullWidth
                inputProps={{ min: 0, step: 100 }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleOpenSession}
                disabled={isOpening}
                startIcon={isOpening ? <CircularProgress size={18} color="inherit" /> : null}
              >
                Abrir caja
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={3}>
            <SessionSummary session={session} />
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Movimientos
              </Typography>
              <MovementsTable movements={session.movements} />
            </Box>
          </Stack>
        )}
      </MainCard>

      <MovementFormModal
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        onSubmit={handleAddMovement}
        isSubmitting={isSubmittingMovement}
        error={movementError}
      />

      <CloseSessionModal
        open={closeOpen}
        expected={Number(session?.balance) || 0}
        onClose={() => setCloseOpen(false)}
        onSubmit={handleClose}
        isSubmitting={isClosing}
        error={closeError}
      />
    </>
  );
}

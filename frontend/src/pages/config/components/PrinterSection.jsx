import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

import MainCard from 'components/cards/MainCard';
import useCompany from 'hooks/useCompany';
import useNotification from 'hooks/useNotification';
import { printService } from 'services/printService';
import { buildTestTicket } from 'utils/escpos';

export default function PrinterSection() {
  const { company } = useCompany();
  const { notify } = useNotification();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      if (!(await printService.isAvailable())) {
        notify.warning('No se detectó el puente de impresión. Abrí el print-agent en la PC de caja.');
        return;
      }
      await printService.printBytes(buildTestTicket(company));
      notify.success('Ticket de prueba enviado a la impresora');
    } catch {
      notify.error('No se pudo imprimir el ticket de prueba');
    } finally {
      setTesting(false);
    }
  };

  return (
    <MainCard title="Impresora de tickets">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Los tickets se imprimen a través del <strong>puente local</strong> (print-agent) que corre en la PC de caja, para que salgan del
        largo justo y con corte automático. Si el puente no está activo, el POS imprime igual por el navegador.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Para activar la impresión térmica, dejá corriendo el print-agent en la caja (ver <code>PRINTING.md</code>). Después probá acá que
        imprima y corte.
      </Alert>

      <Box>
        <Button
          variant="contained"
          startIcon={testing ? <CircularProgress size={16} color="inherit" /> : <PrintOutlinedIcon />}
          onClick={handleTest}
          disabled={testing}
        >
          Probar impresora
        </Button>
      </Box>
    </MainCard>
  );
}

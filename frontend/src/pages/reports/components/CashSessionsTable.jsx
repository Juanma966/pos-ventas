import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import formatCurrency from 'utils/formatCurrency';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—');

function diffColor(diff) {
  if (diff == null || diff === 0) return 'text.primary';
  return diff > 0 ? 'success.main' : 'error.main';
}

export default function CashSessionsTable({ sessions }) {
  if (!sessions.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">No hay cierres de caja en el período</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Apertura</TableCell>
            <TableCell>Cierre</TableCell>
            <TableCell>Usuario</TableCell>
            <TableCell align="right">Inicial</TableCell>
            <TableCell align="right">Esperado</TableCell>
            <TableCell align="right">Contado</TableCell>
            <TableCell align="right">Diferencia</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((s) => (
            <TableRow key={s.id} hover>
              <TableCell>{formatDateTime(s.openedAt)}</TableCell>
              <TableCell>{formatDateTime(s.closedAt)}</TableCell>
              <TableCell>{s.user}</TableCell>
              <TableCell align="right">{formatCurrency(s.openingAmount)}</TableCell>
              <TableCell align="right">{s.expectedAmount != null ? formatCurrency(s.expectedAmount) : '—'}</TableCell>
              <TableCell align="right">{s.closingAmount != null ? formatCurrency(s.closingAmount) : '—'}</TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={500} color={diffColor(s.difference)}>
                  {s.difference != null ? formatCurrency(s.difference) : '—'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

CashSessionsTable.propTypes = {
  sessions: PropTypes.array.isRequired,
};

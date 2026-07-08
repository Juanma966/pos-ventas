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

const TYPE_LABELS = {
  SALE: 'Venta',
  RETURN: 'Devolución',
  INCOME: 'Ingreso',
  EXPENSE: 'Egreso',
};
const ADD_TYPES = ['SALE', 'INCOME'];
const formatTime = (value) => new Date(value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

export default function MovementsTable({ movements }) {
  if (!movements.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sin movimientos todavía</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hora</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell align="right">Monto</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.map((m) => {
            const positive = ADD_TYPES.includes(m.type);
            return (
              <TableRow key={m.id}>
                <TableCell>{formatTime(m.createdAt)}</TableCell>
                <TableCell>{TYPE_LABELS[m.type] ?? m.type}</TableCell>
                <TableCell>{m.description ?? '—'}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color={positive ? 'success.main' : 'error.main'} fontWeight={500}>
                    {positive ? '+' : '-'} {formatCurrency(m.amount)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

MovementsTable.propTypes = {
  movements: PropTypes.array.isRequired,
};

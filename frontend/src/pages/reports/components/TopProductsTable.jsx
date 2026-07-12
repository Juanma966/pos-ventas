import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import formatCurrency from 'utils/formatCurrency';

export default function TopProductsTable({ products }) {
  if (!products.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">Sin ventas en el período</Typography>
      </Box>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Producto</TableCell>
          <TableCell align="right">Unidades</TableCell>
          <TableCell align="right">Facturado</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((p, i) => (
          <TableRow key={p.productId} hover>
            <TableCell>{i + 1}</TableCell>
            <TableCell>{p.name}</TableCell>
            <TableCell align="right">{p.quantity}</TableCell>
            <TableCell align="right">{formatCurrency(p.revenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

TopProductsTable.propTypes = {
  products: PropTypes.array.isRequired,
};

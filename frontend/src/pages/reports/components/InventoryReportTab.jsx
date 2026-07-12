import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import MainCard from 'components/cards/MainCard';
import useInventoryReport from 'hooks/useInventoryReport';
import formatCurrency from 'utils/formatCurrency';
import KpiCard from './KpiCard';

const TYPE_LABELS = {
  PURCHASE: 'Compras',
  SALE: 'Ventas',
  SALE_CANCEL: 'Anulaciones',
  RETURN: 'Devoluciones',
  ADJUSTMENT: 'Ajustes',
};

export default function InventoryReportTab({ from, to }) {
  const { report, isLoading } = useInventoryReport({ from, to });

  if (isLoading || !report) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const v = report.valuation;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Unidades en stock" value={v.totalStockUnits} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Valor a costo" value={formatCurrency(v.totalCostValue)} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Valor a venta" value={formatCurrency(v.totalRetailValue)} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Productos bajo stock" value={v.lowStockCount} /></Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        La valorización es al día de hoy; los movimientos corresponden al rango de fechas seleccionado.
      </Typography>

      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Movimientos por tipo (período)">
            {report.movementsByType.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Sin movimientos en el período</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Movimientos</TableCell>
                    <TableCell align="right">Unidades netas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.movementsByType.map((m) => (
                    <TableRow key={m.type} hover>
                      <TableCell>{TYPE_LABELS[m.type] ?? m.type}</TableCell>
                      <TableCell align="right">{m.count}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500} color={m.netQuantity >= 0 ? 'success.main' : 'error.main'}>
                          {m.netQuantity > 0 ? `+${m.netQuantity}` : m.netQuantity}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Productos con más valor en stock">
            {report.topByValue.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Sin productos</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Valor a costo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.topByValue.map((p) => (
                    <TableRow key={p.productId} hover>
                      <TableCell>{p.name}</TableCell>
                      <TableCell align="right">{p.stock}</TableCell>
                      <TableCell align="right">{formatCurrency(p.costValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}

InventoryReportTab.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

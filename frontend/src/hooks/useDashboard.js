import useSWR from 'swr';
import { reportService } from 'services/reportService';

const FALLBACK = {
  ventasHoy: { monto: 0, variacion: 0 },
  transaccionesHoy: { cantidad: 0, variacion: 0 },
  productosBajoStock: 0,
  clientesNuevosMes: 0,
  ventasMensuales: { esteAnio: Array(12).fill(0), anioAnterior: Array(12).fill(0) },
  ultimasVentas: [],
};

export function useDashboard() {
  const { data, error, isLoading } = useSWR('/reports/dashboard', () => reportService.getDashboard());
  return { ...FALLBACK, ...(data ?? {}), isLoading, error };
}

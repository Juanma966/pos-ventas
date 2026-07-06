// Mock data — reemplazar con SWR + API cuando exista el módulo de ventas:
// import useSWR from 'swr';
// export function useDashboard() {
//   const { data, error, isLoading } = useSWR('/api/dashboard', fetcher);
//   return { ...data, isLoading, error };
// }

export function useDashboard() {
  return {
    isLoading: false,

    ventasHoy: { monto: 45230.5, variacion: 12.5 },
    transaccionesHoy: { cantidad: 28, variacion: 8.3 },
    productosBajoStock: 5,
    clientesNuevosMes: 12,

    transaccionesSemana: [4, 7, 5, 9, 6, 8, 3],
    transaccionesMes: [3, 5, 4, 6, 4, 7, 5, 8, 6, 4, 9, 3, 5, 7, 6, 4, 8, 5, 7, 6, 4, 3, 8, 5, 6, 7, 4, 9, 5, 6],

    ventasMensuales: {
      esteAnio: [38000, 42000, 35000, 50000, 48000, 61000, 45000, 52000, 47000, 58000, 53000, 45230],
      anioAnterior: [30000, 35000, 28000, 42000, 38000, 50000, 36000, 45000, 40000, 48000, 44000, 51000],
    },

    ultimasVentas: [
      { id: 1, cliente: 'Juan García', monto: 3250.0, items: 4, hora: '14:32' },
      { id: 2, cliente: 'María López', monto: 890.5, items: 2, hora: '14:15' },
      { id: 3, cliente: 'Carlos Ruiz', monto: 5120.0, items: 7, hora: '13:58' },
      { id: 4, cliente: 'Ana Martínez', monto: 1450.0, items: 3, hora: '13:40' },
      { id: 5, cliente: 'Pedro Sánchez', monto: 720.0, items: 1, hora: '13:22' },
    ],
  };
}

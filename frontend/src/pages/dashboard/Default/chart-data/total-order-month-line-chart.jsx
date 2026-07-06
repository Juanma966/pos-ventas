// Transacciones de la semana (últimos 7 días)
const chartData = {
  type: 'line',
  height: 90,
  options: {
    chart: { sparkline: { enabled: true } },
    dataLabels: { enabled: false },
    colors: ['#fff'],
    fill: { type: 'solid', opacity: 1 },
    stroke: { curve: 'smooth', width: 3 },
    yaxis: { min: 0, max: 15 },
    tooltip: {
      theme: 'dark',
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: () => 'Transacciones' } },
      marker: { show: false }
    }
  },
  series: [{ name: 'Transacciones', data: [4, 7, 5, 9, 6, 8, 3] }]
};

export default chartData;

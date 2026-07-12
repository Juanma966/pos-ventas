import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';

export default function DailySalesChart({ daily }) {
  const theme = useTheme();

  const options = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: theme.typography.fontFamily },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: [theme.palette.primary.main],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    xaxis: {
      categories: daily.map((d) => d.date.slice(5)),
      labels: { rotate: -45, style: { fontSize: '10px' } },
      tickAmount: Math.min(daily.length, 12),
    },
    yaxis: { labels: { formatter: (v) => new Intl.NumberFormat('es-AR', { notation: 'compact' }).format(v) } },
    tooltip: { y: { formatter: (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v) } },
    grid: { borderColor: theme.palette.divider },
  };

  const series = [{ name: 'Ventas', data: daily.map((d) => d.total) }];

  return <Chart options={options} series={series} type="area" height={320} />;
}

DailySalesChart.propTypes = {
  daily: PropTypes.array.isRequired,
};

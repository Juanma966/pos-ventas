import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';

// Gráfico de área de una serie diaria [{ date: 'YYYY-MM-DD', total }].
export default function DailyTotalChart({ daily, seriesName = 'Total', color }) {
  const theme = useTheme();
  const lineColor = color ?? theme.palette.primary.main;

  const options = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: theme.typography.fontFamily },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: [lineColor],
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

  const series = [{ name: seriesName, data: daily.map((d) => d.total) }];

  return <Chart options={options} series={series} type="area" height={320} />;
}

DailyTotalChart.propTypes = {
  daily: PropTypes.array.isRequired,
  seriesName: PropTypes.string,
  color: PropTypes.string,
};

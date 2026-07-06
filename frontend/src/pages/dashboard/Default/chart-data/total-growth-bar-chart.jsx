const chartData = {
  height: 480,
  type: 'bar',
  options: {
    chart: {
      id: 'bar-chart',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: true }
    },
    responsive: [
      {
        breakpoint: 480,
        options: { legend: { position: 'bottom', offsetX: -10, offsetY: 0 } }
      }
    ],
    plotOptions: {
      bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 }
    },
    xaxis: {
      type: 'category',
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    },
    legend: {
      show: true,
      fontFamily: `'Roboto', sans-serif`,
      position: 'bottom',
      offsetX: 20,
      labels: { useSeriesColors: false },
      markers: { width: 16, height: 16, radius: 5 },
      itemMargin: { horizontal: 15, vertical: 8 }
    },
    fill: { type: 'solid' },
    dataLabels: { enabled: false },
    grid: { show: true },
    tooltip: {
      y: {
        formatter: (val) =>
          new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val)
      }
    }
  },
  series: [
    {
      name: 'Este año',
      data: [38000, 42000, 35000, 50000, 48000, 61000, 45000, 52000, 47000, 58000, 53000, 45230]
    },
    {
      name: 'Año anterior',
      data: [30000, 35000, 28000, 42000, 38000, 50000, 36000, 45000, 40000, 48000, 44000, 51000]
    }
  ]
};

export default chartData;

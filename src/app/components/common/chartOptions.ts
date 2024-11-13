export const options: any = {
  skipNull: true,
  responsive: true,
  scales: {
    y: {
      grid: {
        display: true
      },
      border: {
        dash: [6,4],
        display: false
      },
      ticks: {
        callback: (value: any) => `$${value.toLocaleString()}`, // Format y-axis labels as currency
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  layout: {
    padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};
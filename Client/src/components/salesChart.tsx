import { Box, Paper, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesDataPoint {
  month: string;
  value: number;
}

interface SalesChartProps {
  salesData: SalesDataPoint[];
}

export const SalesChart = ({ salesData }: SalesChartProps) => {
  const chartData: ChartData<"bar"> = {
    labels: salesData.map((item) => item.month),
    datasets: [
      {
        label: "Sales",
        data: salesData.map((item) => item.value),
        backgroundColor: "#11154F",
        borderColor: "#11154F",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Sales",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: "400px" }}>
      <Typography variant="h6" align="center" gutterBottom>
        Monthly Sales
      </Typography>
      <Box sx={{ height: "calc(100% - 40px)" }}>
        <Bar data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

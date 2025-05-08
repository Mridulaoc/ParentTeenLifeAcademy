import { Box, Paper, Typography } from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend
);

interface RevenueDataPoint {
  month: string;
  value: number;
}

interface RevenueChartProps {
  revenueData: RevenueDataPoint[];
}

export const RevenueChart = ({ revenueData }: RevenueChartProps) => {
  const chartData: ChartData<"line"> = {
    labels: revenueData.map((item) => item.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueData.map((item) => item.value),
        backgroundColor: "#11154F",
        borderColor: "#11154F",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Revenue (₹)",
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
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Monthly Revenue
      </Typography>
      <Box sx={{ height: 300, position: "relative" }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

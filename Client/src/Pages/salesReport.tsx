import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { fetchSalesReport } from "../Features/salesReportSlice";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { useSelector } from "react-redux";

type TimePeriod = "day" | "week" | "month" | "3months" | "6months" | "year";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

const SalesReport: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: reportData,
    loading,
    error,
  } = useSelector((state: RootState) => state.salesReport);

  const [timePeriod, setTimePeriod] = useState<TimePeriod>("6months");

  const getDateRange = (period: TimePeriod): DateRange => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }

    return { startDate, endDate };
  };

  const handlePeriodChange = (event: SelectChangeEvent) => {
    const newPeriod = event.target.value as TimePeriod;
    setTimePeriod(newPeriod);
  };

  useEffect(() => {
    const { startDate, endDate } = getDateRange(timePeriod);

    const showSalesReport = async (startDate: Date, endDate: Date) => {
      await dispatch(fetchSalesReport({ startDate, endDate }));
    };

    showSalesReport(startDate, endDate);
  }, [dispatch, timePeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" gutterBottom>
          Sales Report
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="time-period-label">Time Period</InputLabel>
          <Select
            labelId="time-period-label"
            id="time-period-select"
            value={timePeriod}
            label="Time Period"
            onChange={handlePeriodChange}
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="3months">Last 3 Months</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {reportData && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(reportData.summary.totalRevenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4" component="div">
                    {reportData.summary.totalOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Order Value
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(reportData.summary.avgOrderValue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Monthly Data Table */}
          <Typography variant="h6" gutterBottom>
            {timePeriod === "day"
              ? "Hourly"
              : timePeriod === "week"
              ? "Daily"
              : "Monthly"}{" "}
            Sales Data
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    {timePeriod === "day"
                      ? "Hour"
                      : timePeriod === "week"
                      ? "Day"
                      : "Month"}
                  </TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.monthlyData.map((row) => (
                  <TableRow key={row.period}>
                    <TableCell component="th" scope="row">
                      {row.period}
                    </TableCell>
                    <TableCell align="right">{row.orders}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );
};

export default SalesReport;

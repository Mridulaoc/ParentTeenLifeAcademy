import { Typography, Box, CircularProgress, Grid } from "@mui/material";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { StatCard } from "../components/statusCard";
import { RevenueChart } from "../components/revenueChart";
import { fetchDashboardStats } from "../Features/dashboardSlice";
import { SalesChart } from "../components/salesChart";

const AdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { stats, salesData, revenueData, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error loading dashboard: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            iconType="users"
            variant="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            iconType="students"
            variant="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            iconType="courses"
            variant="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Total Bundles"
            value={stats.totalBundles}
            iconType="bundles"
            variant="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            iconType="reviews"
            variant="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            iconType="revenue"
            variant="primary"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <RevenueChart revenueData={revenueData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <SalesChart salesData={salesData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;

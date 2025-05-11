import React, { useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  LinearProgress,
  Divider,
  Chip,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { fetchEnrolledCourses } from "../Features/userSlice";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const EnrolledCourses: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enrolledCourses, loading } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    dispatch(fetchEnrolledCourses());
  }, [dispatch]);

  const getButtonText = (progress: number) => {
    return progress === 0 ? "Start Learning" : "Continue Learning";
  };

  const getButtonColor = (progress: number) => {
    return progress === 0 ? "primary" : "secondary";
  };

  const getDaysRemaining = (expiryDate: string | Date | null) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const today = new Date();

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Loading your courses...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          No Courses Yet
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You haven't enrolled in any courses yet. Explore our course catalog to
          get started.
        </Typography>
        <Button variant="contained" color="primary" href="/courses">
          Browse Courses
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Courses
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {enrolledCourses.map((enrollment) => {
          const daysRemaining = getDaysRemaining(enrollment.expiryDate!);

          return (
            <Grid item xs={12} sm={6} md={4} key={enrollment.courseId._id}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  position: "relative",
                }}
                elevation={3}
              >
                {daysRemaining !== null && (
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={`${daysRemaining} days left`}
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 1,
                      fontWeight: "bold",
                    }}
                  />
                )}

                <CardMedia
                  sx={{
                    paddingTop: "56.25%",
                    borderRadius: 1,
                  }}
                  image={
                    enrollment.courseId.featuredImage ||
                    "/placeholder-course.jpg"
                  }
                  title={enrollment.courseId.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom component="div" noWrap>
                    {enrollment.courseId.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    component="div"
                    noWrap
                  >
                    {enrollment.courseId.durationHours}hr{" "}
                    {enrollment.courseId.durationMinutes}min
                  </Typography>
                  {enrollment.courseId.visibility === "public" && (
                    <Typography
                      variant="body1"
                      gutterBottom
                      component="div"
                      noWrap
                    >
                      {enrollment.courseId.lessons.length} lessons
                    </Typography>
                  )}

                  {/* Access type indicator */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, fontStyle: "italic" }}
                  >
                    {daysRemaining !== null
                      ? "Time-limited access"
                      : "Lifetime access"}
                  </Typography>

                  {enrollment.courseId.visibility === "public" && (
                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {enrollment.progress.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={enrollment.progress}
                        color={
                          enrollment.progress >= 75 ? "success" : "primary"
                        }
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 5,
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
                {enrollment.courseId.visibility === "public" ? (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color={getButtonColor(enrollment.progress)}
                      href={`/courses/${enrollment.courseId._id}/learn`}
                      sx={{
                        marginTop: 1,
                        fontWeight: 600,
                      }}
                    >
                      {getButtonText(enrollment.progress)}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      Recurring Live classes
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color={getButtonColor(enrollment.progress)}
                      href={`/courses/${enrollment.courseId._id}/liveClassDetails`}
                      sx={{
                        marginTop: 1,
                        fontWeight: 600,
                      }}
                    >
                      Join Live Class
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EnrolledCourses;

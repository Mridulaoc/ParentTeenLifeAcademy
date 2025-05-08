import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Typography,
  Box,
  Grid,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";

import { RootState } from "../Store/store";
import { fetchCourseDetails } from "../Features/courseSlice";
import { AppDispatch } from "../Store/store";

import { fetchWishlist } from "../Features/wishlistSlice";
import { fetchCart } from "../Features/cartSlice";

import { fetchEnrollmentStatus } from "../Features/userSlice";
import Join from "../components/joinLive";

const LiveClassDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const dispatch = useDispatch<AppDispatch>();

  const { currentCourse, loading, error } = useSelector(
    (state: RootState) => state.course
  );

  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (isAuthenticated && courseId) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
      dispatch(fetchEnrollmentStatus(courseId));
      dispatch(fetchCourseDetails({ courseId }));
    }
  }, [dispatch, isAuthenticated, courseId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentCourse) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Alert severity="info">No course details found.</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {currentCourse.title}
          </Typography>

          <Paper
            elevation={3}
            sx={{
              mb: 6,
              height: 400,
              overflow: "hidden",
              borderRadius: "12px",
              position: "relative",
            }}
          >
            {currentCourse.featuredImage ? (
              <img
                src={currentCourse.featuredImage}
                alt={currentCourse.title}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Typography variant="body1">
                  Image preview not available
                </Typography>
              </Box>
            )}
          </Paper>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Course Description
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {currentCourse.description}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              What You Will Learn
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {currentCourse.whatYouWillLearn}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Target Audience
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {currentCourse.targetAudience}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4} mt={7}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "12px",
              textAlign: "center",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Live Class Schedule
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2, fontSize: "1.1rem", fontWeight: "bold" }}
            >
              Every Wednesday at 8 PM
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Join />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, fontStyle: "italic" }}
            >
              Don't miss out on our interactive live sessions!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LiveClassDetails;

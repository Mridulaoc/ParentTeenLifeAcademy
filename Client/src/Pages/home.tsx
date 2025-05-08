import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { checkStatus } from "../Features/userSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Typography } from "@mui/material";
import CourseCard from "../components/courseCard";
import { fetchPopularCourses } from "../Features/courseSlice";
import { ArrowRight } from "@mui/icons-material";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const { courses: popularCourses } = useSelector(
    (state: RootState) => state.course
  );

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        dispatch(checkStatus());
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    dispatch(fetchPopularCourses(3));
  }, [dispatch]);

  console.log("Popular courses", popularCourses);

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          backgroundImage: "url('/family.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          margin: 0,
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          pl: 5,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate("/courses")}
        >
          Explore All Courses
        </Button>
      </Box>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography
          variant="h5"
          sx={{
            mt: 4,
            color: "primary.main",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Popular Courses
        </Typography>
        <Grid container spacing={3} padding={5} sx={{ mt: 2 }}>
          {popularCourses.map((course) => (
            <>
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <div
                  onClick={() => handleCourseClick(course._id)}
                  className="cursor-pointer"
                >
                  <CourseCard course={course} />
                </div>
              </Grid>
            </>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate("/courses")}
          sx={{
            m: 5,
            width: "30%",
          }}
        >
          View All Courses <ArrowRight />
        </Button>
      </Box>
    </>
  );
};

export default Home;

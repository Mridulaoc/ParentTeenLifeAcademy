import React, { useEffect, useState } from "react";
import { fetchAllPublicCourses } from "../Features/courseSlice";
import { fetchAllBundles } from "../Features/courseBundleSlice";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useSelector } from "react-redux";
import CourseCard from "../components/courseCard";
import BundleCard from "../components/bundleCard";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { fetchCategories } from "../Features/categorySlice";
import { IFetchPublicCourseInputs } from "../Types/courseTypes";

const Courses = () => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch<AppDispatch>();

  const {
    courses,
    loading: courseLoading,
    total: coursesTotal,
  } = useSelector((state: RootState) => state.course);

  const {
    bundles,
    loading: bundleLoading,
    total: bundlesTotal,
  } = useSelector((state: RootState) => state.bundle);

  const { categories } = useSelector((state: RootState) => state.category);

  const navigate = useNavigate();
  const limit = 3;
  const { control, watch } = useForm({
    defaultValues: {
      search: "",
      category: "",
      sort: "",
    },
  });

  const search = watch("search");
  const category = watch("category");
  const sort = watch("sort");

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  useEffect(() => {
    if (activeTab === 0) {
      const params: IFetchPublicCourseInputs = { page, limit, search, sort };
      if (category && category !== "all") {
        params.category = category;
      }
      dispatch(fetchAllPublicCourses(params));
    } else {
      const params: IFetchPublicCourseInputs = { page, limit, search, sort };
      if (category && category !== "all") {
        params.category = category;
      }
      if (!isAdminRoute) {
        dispatch(fetchAllBundles({ page, limit, search, category, sort }));
      }
    }
  }, [dispatch, page, limit, activeTab, search, category, sort]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const estimatedTotal = activeTab === 0 ? coursesTotal : bundlesTotal;
    const estimatedTotalPages = Math.max(1, Math.ceil(estimatedTotal / limit));
    if (page > estimatedTotalPages) {
      setPage(estimatedTotalPages);
    }
  }, [coursesTotal, bundlesTotal, page, limit, activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setPage(1);
    setActiveTab(newValue);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleBundleClick = (bundleId: string) => {
    navigate(`/bundles/${bundleId}`);
  };

  const isLoading = courseLoading || bundleLoading;
  const total = activeTab === 0 ? coursesTotal : bundlesTotal;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Box sx={{ padding: 5 }}>
      <Typography variant="h4" gutterBottom>
        {activeTab === 0 ? "All Courses" : "Course Bundles"}
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="courses and bundles tabs"
        sx={{ marginBottom: 2 }}
      >
        <Tab label="Courses" />
        <Tab label="Bundles" />
      </Tabs>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Search"
                variant="outlined"
                fullWidth
                sx={{ marginBottom: 2 }}
              />
            )}
          />
        </Box>

        {activeTab === 0 && (
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Category">
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories &&
                      categories.map((cat) => (
                        <MenuItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              />
            </FormControl>
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Controller
              name="sort"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Sort By">
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="popularity">Popularity</MenuItem>
                  <MenuItem value="a-z">A-Z</MenuItem>
                  <MenuItem value="z-a">Z-A</MenuItem>
                  <MenuItem value="latest">Latest</MenuItem>
                </Select>
              )}
            />
          </FormControl>
        </Box>
      </Box>
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : activeTab === 0 && courses.length === 0 ? (
        <Typography>No courses found</Typography>
      ) : activeTab === 1 && bundles.length === 0 ? (
        <Typography>No bundles found</Typography>
      ) : (
        <Grid container spacing={3}>
          {activeTab === 0
            ? courses.map((course) => (
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
              ))
            : bundles.map((bundle) => (
                <Grid item xs={12} sm={6} md={4} key={bundle._id}>
                  <div
                    onClick={() => handleBundleClick(bundle._id!)}
                    className="cursor-pointer"
                  >
                    <BundleCard bundle={bundle} />
                  </div>
                </Grid>
              ))}
        </Grid>
      )}

      <Box display="flex" justifyContent="center" mt={4}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={4}
          gap={2}
        >
          <Typography
            variant="button"
            onClick={() => page > 1 && setPage(page - 1)}
            sx={{
              cursor: page > 1 ? "pointer" : "default",
              color: page > 1 ? "primary.main" : "text.disabled",
              fontWeight: "bold",
              userSelect: "none",
            }}
          >
            Prev
          </Typography>

          {/* Show previous page number if it exists */}
          {page > 1 && (
            <Box
              onClick={() => setPage(page - 1)}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Typography variant="body1">{page - 1}</Typography>
            </Box>
          )}

          {/* Current page */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <Typography variant="body1">{page}</Typography>
          </Box>

          {/* Show next page number if it exists */}
          {page < totalPages && (
            <Box
              onClick={() => setPage(page + 1)}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Typography variant="body1">{page + 1}</Typography>
            </Box>
          )}

          <Typography
            variant="button"
            onClick={() => page < totalPages && setPage(page + 1)}
            sx={{
              cursor: page < totalPages ? "pointer" : "default",
              color: page < totalPages ? "primary.main" : "text.disabled",
              fontWeight: "bold",
              userSelect: "none",
            }}
          >
            Next
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Courses;

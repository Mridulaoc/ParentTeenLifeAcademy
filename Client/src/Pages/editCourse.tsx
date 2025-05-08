import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  Paper,
  CircularProgress,
} from "@mui/material";
import { AppDispatch, RootState } from "../Store/store";
import { fetchCategories } from "../Features/categorySlice";
import {
  fetchCourseDetails,
  updateCourse,
  uploadFeaturedImage,
  uploadIntroVideo,
} from "../Features/courseSlice";
import { toast } from "react-toastify";

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  visibility: z.enum(["public", "private"]) as z.ZodType<"public" | "private">,
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be a positive number or zero"),
  introVideoUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
  whatYouWillLearn: z
    .string()
    .min(10, "What You Will Learn must be at least 10 characters long"),
  targetAudience: z
    .string()
    .min(10, "Target Audience must be at least 10 characters long"),
  durationHours: z.coerce.number().min(0, "Hours must be positive or zero"),
  durationMinutes: z.coerce
    .number()
    .min(0, "Minutes must be positive or zero")
    .max(59, "Minutes must be less than 60"),
  featuredImage: z.string(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export const EditCourse: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const [videoType, setVideoType] = useState<"upload" | "url">("url");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { categories } = useSelector((state: RootState) => state.category);
  const { currentCourse } = useSelector((state: RootState) => state.course);
  const { admin } = useSelector((state: RootState) => state.admin);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      visibility: "public" as const,
      category: "",
      price: 0,
      introVideoUrl: "",
      whatYouWillLearn: "",
      targetAudience: "",
      durationHours: 0,
      durationMinutes: 0,
      featuredImage: "",
    },
  });

  const featuredImage = watch("featuredImage");

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        if (courseId && isAdminRoute) {
          await dispatch(fetchCourseDetails({ courseId, admin }));
          await dispatch(fetchCategories());
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast.error("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [dispatch, courseId]);

  useEffect(() => {
    if (currentCourse && !isLoading) {
      const imageUrl = currentCourse.featuredImage || "";

      reset({
        title: currentCourse.title || "",
        description: currentCourse.description || "",
        visibility: currentCourse.visibility || "public",
        category: currentCourse.category || "",
        price: currentCourse.price || 0,
        introVideoUrl: currentCourse.introVideoUrl || "",
        whatYouWillLearn: currentCourse.whatYouWillLearn || "",
        targetAudience: currentCourse.targetAudience || "",
        durationHours: currentCourse.durationHours,
        durationMinutes: currentCourse.durationMinutes,
        featuredImage: imageUrl,
      });

      if (currentCourse.introVideoUrl) {
        setVideoType("url");
      }
    }
  }, [currentCourse, isLoading, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFeaturedImageFile(e.target.files[0]);

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setValue("featuredImage", reader.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    if (!courseId) return;

    setIsUploading(true);
    try {
      let featuredImageUrl = data.featuredImage;
      let introVideoUrl = data.introVideoUrl;

      if (featuredImageFile) {
        const formData = new FormData();
        formData.append("featuredImage", featuredImageFile);
        const response = await dispatch(uploadFeaturedImage(formData)).unwrap();
        featuredImageUrl = response.url;
      }

      if (videoType === "upload" && videoFile) {
        const formData = new FormData();
        formData.append("video", videoFile);
        const response = await dispatch(uploadIntroVideo(formData)).unwrap();
        introVideoUrl = response;
      }

      const courseData = {
        ...data,
        featuredImage: featuredImageUrl,
        introVideoUrl: introVideoUrl || "",
        visibility: data.visibility as "public" | "private",
      };

      const result = await dispatch(
        updateCourse({ courseData, courseId })
      ).unwrap();
      toast.success(result.message);
      navigate(`/admin/dashboard/courses`);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: "auto", mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Edit Course
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course Title"
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Category" value={field.value}>
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.category && (
                <FormHelperText>{errors.category.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              {...register("price", { valueAsNumber: true })}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="visibility-label">Course Visibility</InputLabel>
              <Controller
                name="visibility"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="visibility-label"
                    label="Course Visibility"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              What You Will Learn
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="What You Will Learn"
              multiline
              rows={4}
              placeholder="Describe what students will learn from this course"
              {...register("whatYouWillLearn")}
              error={!!errors.whatYouWillLearn}
              helperText={errors.whatYouWillLearn?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Target Audience
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Target Audience"
              multiline
              rows={4}
              placeholder="Describe who this course is designed for"
              {...register("targetAudience")}
              error={!!errors.targetAudience}
              helperText={errors.targetAudience?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Course Duration
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hours"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              {...register("durationHours", { valueAsNumber: true })}
              error={!!errors.durationHours}
              helperText={errors.durationHours?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minutes"
              type="number"
              InputProps={{ inputProps: { min: 0, max: 59 } }}
              {...register("durationMinutes", { valueAsNumber: true })}
              error={!!errors.durationMinutes}
              helperText={errors.durationMinutes?.message}
            />
          </Grid>

          {/* Featured Image */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Featured Image
            </Typography>
          </Grid>

          <Grid item xs={12}>
            {featuredImage && (
              <Box mb={2} sx={{ maxWidth: 300 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  color="textSecondary"
                >
                  Featured Image:
                </Typography>
                <img
                  src={featuredImage}
                  alt="Featured Preview"
                  style={{ width: "100%", borderRadius: 4 }}
                />
              </Box>
            )}
            <input
              type="file"
              accept="image/*"
              id="featured-image-upload"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <label htmlFor="featured-image-upload">
              <Button variant="contained" component="span">
                Change Featured Image
              </Button>
            </label>
            {errors.featuredImage && (
              <FormHelperText error>
                {errors.featuredImage.message}
              </FormHelperText>
            )}
          </Grid>

          {/* Intro Video */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Intro Video
            </Typography>
            <Box mb={2}>
              <Button
                variant={videoType === "url" ? "contained" : "outlined"}
                onClick={() => setVideoType("url")}
                sx={{ mr: 1 }}
              >
                Use URL
              </Button>
              <Button
                variant={videoType === "upload" ? "contained" : "outlined"}
                onClick={() => setVideoType("upload")}
              >
                Upload Video
              </Button>
            </Box>
          </Grid>

          {videoType === "url" ? (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Video URL (YouTube or Vimeo)"
                {...register("introVideoUrl")}
                error={!!errors.introVideoUrl}
                helperText={errors.introVideoUrl?.message}
                placeholder="https://youtube.com/watch?v=..."
              />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <input
                type="file"
                accept="video/*"
                id="video-upload"
                style={{ display: "none" }}
                onChange={handleVideoUpload}
              />
              <label htmlFor="video-upload">
                <Button variant="contained" component="span">
                  {watch("introVideoUrl") ? "Change Video" : "Upload Video"}
                </Button>
              </label>
              {videoFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {videoFile.name}
                </Typography>
              )}
              {watch("introVideoUrl") && !videoFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Current video will be used unless new video is uploaded
                </Typography>
              )}
            </Grid>
          )}

          {/* Submit Button */}
          <Grid item xs={12} mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isUploading}
            >
              {isUploading ? "Saving..." : "Update Course"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => navigate("/admin/dashboard/courses")}
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

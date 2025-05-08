import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import { fetchCategories } from "../Features/categorySlice";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { useSelector } from "react-redux";
import { CourseData } from "../Pages/addCourse";

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  whatYouWillLearn: z
    .string()
    .min(10, "Learning outcomes must be at least 10 characters"),
  targetAudience: z
    .string()
    .min(10, "Target audience must be at least 10 characters"),
  visibility: z.enum(["public", "private", "unlisted"]),
  category: z.string().min(1, "Please select a category"),
  price: z.number().min(0, "Price must be 0 or greater"),
  featuredImage: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return ["image/jpeg", "image/png"].includes(file.type);
    }, "Only .jpg and .png files are allowed"),
  videoType: z.enum(["upload", "youtube", "vimeo"]),
  videoUrl: z.string().optional(),
  videoFile: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return ["video/mp4", "video/quicktime"].includes(file.type);
    }, "Only .mp4 and .mov files are allowed"),
});

type FormData = z.infer<typeof formSchema>;

interface BasicProps {
  initialData?: CourseData | null;
  onChange?: (data: CourseData) => void;
}

const Basics: React.FC<BasicProps> = ({ initialData, onChange }) => {
  const [videoInputType, setVideoInputType] = useState<"upload" | "url">(
    "upload"
  );
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      visibility: "public",
      videoType: "upload",
      price: 0,
      whatYouWillLearn: "",
      targetAudience: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (onChange) {
      const timer = setTimeout(() => {
        const isValid = Object.keys(errors).length === 0;
        if (isValid) {
          onChange(formValues);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formValues, errors, onChange]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: "featuredImage" | "videoFile"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue(fieldName, file);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Create New Course
      </Typography>
      <TextField
        fullWidth
        label="Title"
        {...register("title")}
        error={!!errors.title}
        helperText={errors.title?.message}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Description"
        multiline
        rows={4}
        {...register("description")}
        error={!!errors.description}
        helperText={errors.description?.message}
        margin="normal"
      />
      <TextField
        fullWidth
        label="What You Will Learn"
        multiline
        rows={3}
        placeholder="Enter learning outcomes for your course"
        {...register("whatYouWillLearn")}
        error={!!errors.whatYouWillLearn}
        helperText={errors.whatYouWillLearn?.message}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Target Audience"
        multiline
        rows={3}
        placeholder="Describe who this course is for"
        {...register("targetAudience")}
        error={!!errors.targetAudience}
        helperText={errors.targetAudience?.message}
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Visibility</InputLabel>
        <Select {...register("visibility")}>
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
          <MenuItem value="unlisted">Unlisted</MenuItem>
        </Select>
        {errors.visibility && (
          <FormHelperText error>{errors.visibility.message}</FormHelperText>
        )}
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select {...register("category")}>
          {categories.map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
        {errors.category && (
          <FormHelperText error>{errors.category.message}</FormHelperText>
        )}
      </FormControl>

      <TextField
        fullWidth
        label="Price"
        type="number"
        InputProps={{
          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
        }}
        {...register("price", { valueAsNumber: true })}
        error={!!errors.price}
        helperText={errors.price?.message}
        margin="normal"
      />
      <Box margin="normal">
        <Typography variant="subtitle1">Featured Image</Typography>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => handleFileChange(e, "featuredImage")}
        />
        {errors.featuredImage && (
          <FormHelperText error>{errors.featuredImage.message}</FormHelperText>
        )}
      </Box>
      <Box margin="normal">
        <Typography variant="subtitle1">Intro Video</Typography>
        <RadioGroup
          value={videoInputType}
          onChange={(e) =>
            setVideoInputType(e.target.value as "upload" | "url")
          }
        >
          <FormControlLabel
            value="upload"
            control={<Radio />}
            label="Upload Video"
          />
          <FormControlLabel value="url" control={<Radio />} label="Video URL" />
        </RadioGroup>

        {videoInputType === "upload" ? (
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={(e) => handleFileChange(e, "videoFile")}
          />
        ) : (
          <TextField
            fullWidth
            label="Video URL (YouTube/Vimeo)"
            {...register("videoUrl")}
            error={!!errors.videoUrl}
            helperText={errors.videoUrl?.message}
          />
        )}
      </Box>
    </Box>
  );
};

export default Basics;

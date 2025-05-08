import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  IconButton,
  Card,
  CardContent,
  ButtonGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { AppDispatch } from "../Store/store";
import { uploadIntroVideo } from "../Features/courseSlice";
import { addLessons } from "../Features/lessonSlice";
import { toast } from "react-toastify";

const lessonSchema = z.object({
  lessons: z.array(
    z.object({
      title: z.string().min(3, "Title must be at least 3 characters long"),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters long"),
      videoUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
    })
  ),
});

type LessonFormData = z.infer<typeof lessonSchema>;

const CourseLessons: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courseId } = useParams<{ courseId: string }>();

  const [isUploading, setIsUploading] = useState(false);
  const [videoTypes, setVideoTypes] = useState<{
    [key: number]: "url" | "upload";
  }>({});
  const [videoFiles, setVideoFiles] = useState<{ [key: number]: File | null }>(
    {}
  );
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      lessons: [{ title: "", description: "", videoUrl: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lessons",
  });

  const handleVideoTypeChange = (index: number, type: "url" | "upload") => {
    setVideoTypes((prev) => ({ ...prev, [index]: type }));
    setValue(`lessons.${index}.videoUrl`, "");
    setVideoFiles((prev) => ({ ...prev, [index]: null }));
  };

  const handleVideoUpload = async (index: number, file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const response = await dispatch(uploadIntroVideo(formData)).unwrap();
      setValue(`lessons.${index}.videoUrl`, response.url);
      setVideoFiles((prev) => ({ ...prev, [index]: file }));
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: LessonFormData) => {
    if (!courseId) return;

    try {
      const result = await dispatch(
        addLessons({
          courseId,
          lessons: data.lessons,
        })
      ).unwrap();

      toast.success(result.message);
      navigate(`/admin/dashboard/courses/${courseId}/lessonsList`);
    } catch (error) {
      console.error("Error saving lessons:", error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: "auto", mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Course Lessons
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mb={3}>
          <Button
            variant="contained"
            onClick={() => {
              append({ title: "", description: "", videoUrl: "" });
              const newIndex = fields.length;
              setVideoTypes((prev) => ({ ...prev, [newIndex]: "url" }));
            }}
            sx={{ mb: 2 }}
          >
            Add New Lesson
          </Button>
        </Box>

        {fields.map((field, index) => (
          <Card key={field.id} sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={11}>
                  <Typography variant="h6">Lesson {index + 1}</Typography>
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`lessons.${index}.title`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Lesson Title"
                        error={!!errors.lessons?.[index]?.title}
                        helperText={errors.lessons?.[index]?.title?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`lessons.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="Lesson Description"
                        error={!!errors.lessons?.[index]?.description}
                        helperText={
                          errors.lessons?.[index]?.description?.message
                        }
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Lesson Video
                  </Typography>
                  <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
                    <Button
                      variant={
                        videoTypes[index] === "url" ? "contained" : "outlined"
                      }
                      onClick={() => handleVideoTypeChange(index, "url")}
                    >
                      Use URL
                    </Button>
                    <Button
                      variant={
                        videoTypes[index] === "upload"
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => handleVideoTypeChange(index, "upload")}
                    >
                      Upload Video
                    </Button>
                  </ButtonGroup>

                  {videoTypes[index] === "upload" ? (
                    <Box>
                      <input
                        type="file"
                        accept="video/*"
                        id={`video-upload-${index}`}
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleVideoUpload(index, e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor={`video-upload-${index}`}>
                        <Button
                          variant="contained"
                          component="span"
                          sx={{ mr: 2 }}
                        >
                          Upload Video
                        </Button>
                      </label>
                      {videoFiles[index] && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {videoFiles[index]?.name}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Controller
                      name={`lessons.${index}.videoUrl`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Video URL (YouTube or Vimeo)"
                          placeholder="https://youtube.com/watch?v=..."
                          error={!!errors.lessons?.[index]?.videoUrl}
                          helperText={
                            errors.lessons?.[index]?.videoUrl?.message
                          }
                        />
                      )}
                    />
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={isUploading}
          sx={{ mt: 3 }}
        >
          {isUploading ? "Uploading..." : "Save Lessons"}
        </Button>
      </form>
    </Paper>
  );
};
export default CourseLessons;

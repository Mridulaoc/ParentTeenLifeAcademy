import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Modal,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  ButtonGroup,
  FormHelperText,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { AppDispatch, RootState } from "../Store/store";
import { toast } from "react-toastify";
import { ILesson, ILessonFormData } from "../Types/lessonTypes";
import {
  addLessons,
  deleteLesson,
  fetchLessons,
  updateLesson,
} from "../Features/lessonSlice";
import { uploadIntroVideo } from "../Features/courseSlice";

const lessonSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be atleast 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be atleast 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  videoUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)),
});
type LessonFormData = z.infer<typeof lessonSchema>;
const LessonsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courseId } = useParams<{ courseId: string }>();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  const [addVideoType, setAddVideoType] = useState<"url" | "upload">("url");
  const [editVideoType, setEditVideoType] = useState<"url" | "upload">("url");
  const [addVideoFile, setAddVideoFile] = useState<File | null>(null);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);

  const addForm = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
    },
  });

  const editForm = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
    },
  });

  const { lessons, loading, error, total } = useSelector(
    (state: RootState) => state.lesson
  );

  useEffect(() => {
    if (courseId) {
      dispatch(
        fetchLessons({
          courseId,
          data: {
            page,
            limit,
          },
        })
      );
    }
  }, [dispatch, courseId, page, limit]);

  const handleVideoUpload = async (file: File, isEdit: boolean) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const response = await dispatch(uploadIntroVideo(formData)).unwrap();

      if (isEdit) {
        editForm.setValue("videoUrl", response);
        setEditVideoFile(file);
      } else {
        addForm.setValue("videoUrl", response);
        setAddVideoFile(file);
      }
    } catch (error) {
      toast.error("Error uploading video");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleEditClick = (lesson: ILesson) => {
    setSelectedLesson(lesson);
    editForm.reset({
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl,
    });
    setEditVideoType("url");
    setEditVideoFile(null);
    setOpenEditModal(true);
  };

  const handleEditSubmit = async (data: LessonFormData) => {
    if (!selectedLesson?._id) return;

    try {
      const result = await dispatch(
        updateLesson({
          lessonId: selectedLesson._id,
          lessonData: data,
        })
      ).unwrap();

      if (result.lesson) {
        toast.success("Lesson updated successfully");
        setOpenEditModal(false);
        editForm.reset();

        if (courseId) {
          await dispatch(
            fetchLessons({ courseId, data: { page, limit } })
          ).unwrap();
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update lesson";
      toast.error(errorMessage);
    }
  };

  const handleAddSubmit = async (data: LessonFormData) => {
    if (!courseId) {
      toast.error("Course ID is required");
      return;
    }
    try {
      const lessonData: ILessonFormData = {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl || "",
      };

      const result = await dispatch(
        addLessons({
          courseId,
          lessons: lessonData,
        })
      ).unwrap();
      if (result) {
        toast.success("Lesson added successfully");
        setOpenAddModal(false);
        addForm.reset();
        setAddVideoType("url");
        setAddVideoFile(null);
        await dispatch(
          fetchLessons({
            courseId,
            data: { page, limit },
          })
        ).unwrap();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add lesson";
      toast.error(errorMessage);
    }
  };

  const handleVideoTypeChange = (type: "url" | "upload", isEdit: boolean) => {
    if (isEdit) {
      setEditVideoType(type);
      editForm.setValue("videoUrl", "");
      setEditVideoFile(null);
    } else {
      setAddVideoType(type);
      addForm.setValue("videoUrl", "");
      setAddVideoFile(null);
    }
  };

  const renderVideoSection = (isEdit: boolean) => {
    const form = isEdit ? editForm : addForm;
    const videoType = isEdit ? editVideoType : addVideoType;
    const videoFile = isEdit ? editVideoFile : addVideoFile;

    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Lesson Video
        </Typography>
        <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
          <Button
            variant={videoType === "url" ? "contained" : "outlined"}
            onClick={() => handleVideoTypeChange("url", isEdit)}
          >
            Use URL
          </Button>
          <Button
            variant={videoType === "upload" ? "contained" : "outlined"}
            onClick={() => handleVideoTypeChange("upload", isEdit)}
          >
            Upload Video
          </Button>
        </ButtonGroup>

        {videoType === "upload" ? (
          <Box>
            <input
              type="file"
              accept="video/*"
              id={`video-upload-${isEdit ? "edit" : "add"}`}
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleVideoUpload(e.target.files[0], isEdit);
                }
              }}
            />
            <label htmlFor={`video-upload-${isEdit ? "edit" : "add"}`}>
              <Button
                variant="contained"
                component="span"
                disabled={isUploading}
                sx={{ mr: 2 }}
              >
                {isUploading ? "Uploading..." : "Upload Video"}
              </Button>
            </label>
            {videoFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {videoFile.name}
              </Typography>
            )}
          </Box>
        ) : (
          <Controller
            name="videoUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <TextField
                  {...field}
                  fullWidth
                  label="Video URL (YouTube or Vimeo)"
                  placeholder="https://youtube.com/watch?v=..."
                  error={!!fieldState.error}
                />
                {fieldState.error && (
                  <FormHelperText error>
                    {fieldState.error.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        )}
      </Box>
    );
  };
  const handleDeleteClick = (lesson: ILesson) => {
    setSelectedLesson(lesson);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLesson?._id) return;
    try {
      await dispatch(deleteLesson(selectedLesson._id)).unwrap();
      toast.success("Lesson deleted successfully");
      setOpenDeleteDialog(false);
      if (courseId) {
        dispatch(fetchLessons({ courseId, data: { page, limit } }));
      }
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  if (loading) {
    return <Box sx={{ textAlign: "center", py: 3 }}>Loading...</Box>;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 3, color: "error.main" }}>
        {error}
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Course Lessons
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenAddModal(true)}
      >
        Add Lesson
      </Button>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell width={120} align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.map((lesson: ILesson) => (
              <TableRow key={lesson._id} hover>
                <TableCell>{lesson.title}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Edit Lesson">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(lesson)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Lesson">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(lesson)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" p={3}>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Modal for adding  */}
      <Modal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          addForm.reset();
        }}
        aria-labelledby="add-lesson-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add New Lesson
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              return addForm.handleSubmit(handleAddSubmit)(e);
            }}
          >
            <Stack spacing={3}>
              <Controller
                name="title"
                control={addForm.control}
                render={({ field, fieldState }) => (
                  <>
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </>
                )}
              />
              <Controller
                name="description"
                control={addForm.control}
                render={({ field, fieldState }) => (
                  <>
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </>
                )}
              />
              {renderVideoSection(false)}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  onClick={() => {
                    setOpenAddModal(false);
                    addForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isUploading}
                >
                  Save Lesson
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Modal>
      {/* Modal for edit  */}
      <Modal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          editForm.reset();
        }}
        aria-labelledby="edit-lesson-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Edit Lesson
          </Typography>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="title"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <>
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </>
                )}
              />
              <Controller
                name="description"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <>
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      rows={4}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </>
                )}
              />
              {renderVideoSection(true)}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  onClick={() => {
                    setOpenEditModal(false);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isUploading}
                >
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Modal>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this lesson?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LessonsList;

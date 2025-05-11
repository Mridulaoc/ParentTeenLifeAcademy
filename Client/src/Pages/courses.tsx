import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../Store/store";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Button,
  Pagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import { deleteCourse, fetchCourses } from "../Features/courseSlice";
import { toast } from "react-toastify";

const CourseManagement = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { courses, loading, error, total } = useSelector(
    (state: RootState) => state.course
  );
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchCourses({ page, limit }));
  }, [dispatch, page, limit]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleAddCourse = () => {
    navigate("/admin/dashboard/courses/add");
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/admin/dashboard/courses/${courseId}`);
  };

  const handleViewLessons = (courseId: string) => {
    navigate(`/admin/dashboard/courses/${courseId}/lessonsList`);
  };

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!courseToDelete) {
        throw new Error("No course to delete");
      }
      await dispatch(deleteCourse(courseToDelete));
      toast.success("Course deleted successfully");
      setOpenDeleteDialog(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Failed to delete course:", error);
      setOpenDeleteDialog(false);
      setCourseToDelete(null);
      toast.error("Failed to delete course");
    }
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
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5">Course Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCourse}
        >
          Add New Course
        </Button>
      </Box>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Visibility</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id} hover>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.category.name}</TableCell>
                <TableCell>₹{course.price}</TableCell>
                <TableCell style={{ textTransform: "capitalize" }}>
                  {course.visibility}
                </TableCell>
                <TableCell>{moment(course.createdAt).format("LL")}</TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="View Lessons">
                      <IconButton
                        size="small"
                        onClick={() => handleViewLessons(course._id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Course">
                      <IconButton
                        size="small"
                        onClick={() => handleEditCourse(course._id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Course">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(course._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
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

export default CourseManagement;

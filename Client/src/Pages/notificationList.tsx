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
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import {
  deleteNotification,
  fetchAllNotifications,
} from "../Features/notificationSlice";
import { toast } from "react-toastify";

const NotificationManagement = () => {
  const { admin: adminId, token: adminToken } = useSelector(
    (state: RootState) => state.admin
  );

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications, loading, error, total } = useSelector(
    (state: RootState) => state.notification
  );
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchAllNotifications({ page, limit }));
  }, [dispatch, page, limit]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleAddNotification = () => {
    navigate("/admin/dashboard/notifications/add");
  };

  const handleDeleteClick = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!notificationToDelete) {
        throw new Error("No notification to delete");
      }
      await dispatch(deleteNotification(notificationToDelete));
      await dispatch(fetchAllNotifications({ page, limit }));
      toast.success("Notification deleted successfully");
      setOpenDeleteDialog(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setOpenDeleteDialog(false);
      setNotificationToDelete(null);
      toast.error("Failed to delete notification");
    }
  };

  const getTargetTypeLabel = (targetType: string): string => {
    const labels: { [key: string]: string } = {
      all: "All Users",
      specific: "Specific Users",
      bundle: "Bundle",
      course: "Course",
    };
    return labels[targetType] || targetType;
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
        <Typography variant="h5">Notification Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNotification}
        >
          Create Notification
        </Button>
      </Box>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Target Type</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications?.map((notification) => (
              <TableRow key={notification._id} hover>
                <TableCell>{notification.title}</TableCell>
                <TableCell>
                  {notification.message.length > 40
                    ? `${notification.message.substring(0, 40)}...`
                    : notification.message}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTargetTypeLabel(notification.targetType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {moment(notification.createdAt).format("LL")}
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Delete Notification">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(notification._id)}
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
          Are you sure you want to delete this notification? This action cannot
          be undone.
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

export default NotificationManagement;

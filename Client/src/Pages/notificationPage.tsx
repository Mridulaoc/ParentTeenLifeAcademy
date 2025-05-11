import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Container,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markNotificationAsRead,
} from "../Features/notificationSlice";
import { AppDispatch, RootState } from "../Store/store";
import moment from "moment";
import notificationSocketService from "../Services/notificationSocketService";

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userNotifications, loading, error, total } = useSelector(
    (state: RootState) => state.notification
  );

  const userId = useSelector((state: RootState) => state.user.user._id);

  const [page, setPage] = useState<number>(1);
  const limit = 5;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserNotifications({ userId, page, limit }));
    }
  }, [dispatch, userId, page]);

  const handleNotificationClick = (notificationId: string) => {
    if (userId) {
      dispatch(markNotificationAsRead(notificationId));
      dispatch(markNotificationRead({ userId, notificationId }));
      notificationSocketService.markNotificationRead(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>

          <Button
            variant="outlined"
            onClick={handleMarkAllAsRead}
            disabled={
              userNotifications.length === 0 ||
              userNotifications.every((n) => n.isRead)
            }
          >
            Mark all as read
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : userNotifications.length === 0 ? (
          <Typography align="center" py={5}>
            No notifications to display
          </Typography>
        ) : (
          <>
            <List>
              {userNotifications.map((notification) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      cursor: "pointer",
                      backgroundColor: notification.isRead
                        ? "inherit"
                        : "rgba(25, 118, 210, 0.08)",
                      borderLeft: notification.isRead
                        ? "none"
                        : "4px solid #1976d2",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                      p: 2,
                    }}
                    onClick={() => handleNotificationClick(notification._id!)}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: notification.isRead ? "normal" : "bold",
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography
                            variant="body2"
                            component="div"
                            color="text.primary"
                            gutterBottom
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {moment(notification.createdAt).fromNow()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;

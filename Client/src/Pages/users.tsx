import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { blockUser, fetchAllUsers } from "../Features/adminSlice";
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
} from "@mui/material";
import moment from "moment";

const UserManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error, total } = useSelector(
    (state: RootState) => state.admin
  );
  const [page, setPage] = useState(1);
  const limit = 5;
  useEffect(() => {
    dispatch(fetchAllUsers({ page, limit }));
  }, [dispatch, page, limit]);

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

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleBlockUser = (userId: string) => {
    dispatch(blockUser({ userId }));
  };

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
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          User Management
        </Typography>
      </Box>

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{moment(user.createdAt).format("LL")}</TableCell>
                <TableCell>{user.isBlocked ? "Blocked" : "Active"}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => handleBlockUser(user._id.toString())}
                  >
                    {user.isBlocked ? "UNBLOCK" : "BLOCK"}
                  </Button>
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
    </Paper>
  );
};

export default UserManagement;

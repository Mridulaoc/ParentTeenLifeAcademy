import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { fetchAllReviews } from "../Features/reviewSlice";
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
  Rating,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import moment from "moment";

const ReviewManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reviews, loading, error, totalReviews } = useSelector(
    (state: RootState) => state.review
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    dispatch(
      fetchAllReviews({
        page,
        limit,
        searchTerm,
      })
    );
  }, [dispatch, page, limit, searchTerm]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReview(null);
  };

  if (loading && reviews.length === 0) {
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
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          Review Management
        </Typography>

        <TextField
          label="Search reviews"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by course name"
          sx={{ mb: 3 }}
        />
      </Box>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    No reviews found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id} hover>
                  <TableCell>
                    {review.courseId?.title || `Course ID: ${review.courseId}`}
                  </TableCell>
                  <TableCell>
                    {review.userId?.username || `User ID: ${review.userId}`}
                  </TableCell>
                  <TableCell>
                    <Rating
                      value={review.rating}
                      readOnly
                      precision={0.1}
                      size="medium"
                      sx={{ color: "secondary.main" }}
                    />
                  </TableCell>
                  <TableCell>{review.title}</TableCell>
                  <TableCell>{moment(review.createdAt).format("LL")}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewReview(review)}
                      >
                        View
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" p={3}>
        <Pagination
          count={Math.ceil(totalReviews / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Review Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedReview && (
          <>
            <DialogTitle>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6">{selectedReview.title}</Typography>
                <Rating
                  value={selectedReview.rating}
                  readOnly
                  precision={0.1}
                  size="medium"
                  sx={{ color: "secondary.main" }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <strong>Course:</strong>{" "}
                {selectedReview.courseId?.title ||
                  `Course ID: ${selectedReview.courseId}`}
              </DialogContentText>
              <DialogContentText>
                <strong>User:</strong>{" "}
                {selectedReview.userId?.username ||
                  `User ID: ${selectedReview.userId}`}
              </DialogContentText>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Posted:</strong>{" "}
                {moment(selectedReview.createdAt).format("LL")}
              </DialogContentText>
              <Typography variant="subtitle1">
                <strong>Review:</strong>
              </Typography>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                <Typography variant="body1">
                  {selectedReview.reviewText}
                </Typography>
              </Paper>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default ReviewManagement;

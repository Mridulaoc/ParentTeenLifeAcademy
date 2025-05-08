import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Divider,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  Modal,
  Rating,
  TextField,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder,
} from "@mui/icons-material";
import { RootState } from "../Store/store";
import { fetchCourseDetails } from "../Features/courseSlice";
import { AppDispatch } from "../Store/store";
import VideoPlayer from "../components/videoPlayer";
import { toast } from "react-toastify";
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from "../Features/wishlistSlice";
import { addToCart, fetchCart } from "../Features/cartSlice";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchEnrollmentStatus } from "../Features/userSlice";
import {
  addReview,
  deleteReview,
  fetchCourseReviews,
  updateReview,
} from "../Features/reviewSlice";
import { IReview } from "../Types/reviewTypes";

const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .refine((val) => val >= 1 && val <= 5, {
      message: "Rating must be between 1 and 5",
    }),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  reviewText: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review cannot exceed 1000 characters")
    .trim(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const CourseDetails: React.FC = () => {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<IReview | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentCourse, loading, error } = useSelector(
    (state: RootState) => state.course
  );

  const { isAuthenticated, isEnrolled, user } = useSelector(
    (state: RootState) => state.user
  );
  const { items: wishlistItems } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const {
    loading: reviewsLoading,
    error: reviewsError,
    reviews,
  } = useSelector((state: RootState) => state.review);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
      reviewText: "",
    },
  });
  const ratingValue = watch("rating", 0);

  useEffect(() => {
    if (user && reviews.length > 0) {
      const review = reviews.find((review) => review.userId._id === user._id);

      setUserReview(review || null);
    }
  }, [reviews, user]);

  useEffect(() => {
    if (userReview) {
      setValue("rating", userReview.rating);
      setValue("title", userReview.title);
      setValue("reviewText", userReview.reviewText);
    } else {
      reset();
    }
  }, [userReview, setValue, reset]);

  const isInWishlist = wishlistItems?.some((wishlistItem) => {
    if (wishlistItem.item && typeof wishlistItem.item === "object") {
      return wishlistItem.item._id === courseId;
    }
    return false;
  });

  const isInCart = cartItems?.some((cartItem) => {
    if (cartItem.item && typeof cartItem.item === "object") {
      return cartItem.item._id === courseId;
    }
    return false;
  });

  const [page, setPage] = useState(1);
  const limit = 5;
  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseDetails({ courseId }));
      dispatch(fetchCourseReviews({ courseId, data: { page, limit } }));
    }
  }, [dispatch, courseId, page]);

  useEffect(() => {
    if (isAuthenticated && courseId) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
      dispatch(fetchEnrollmentStatus(courseId));
    }
  }, [dispatch, isAuthenticated, courseId]);

  const handleReviewSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    if (userReview) {
      await dispatch(
        updateReview({
          courseId: courseId!,
          reviewId: userReview._id!,
          reviewData: data,
        })
      ).unwrap();
      toast.success("Review updated successfully");
    } else {
      await dispatch(
        addReview({ courseId: courseId!, reviewData: data })
      ).unwrap();
      toast.success("Review added successfully");
    }
    dispatch(
      fetchCourseReviews({ courseId: courseId!, data: { page, limit } })
    );
    dispatch(fetchCourseDetails(courseId!));
    reset();
    setReviewModalOpen(false);
    setIsSubmitting(false);
  };
  const handleDeleteReview = async () => {
    if (userReview) {
      await dispatch(
        deleteReview({ courseId: courseId!, reviewId: userReview._id! })
      ).unwrap();
      toast.success("Review deleted successfully");
      dispatch(
        fetchCourseReviews({ courseId: courseId!, data: { page, limit } })
      );
      dispatch(fetchCourseDetails(courseId!));
      setUserReview(null);
    }
  };
  const handleAuthRequiredAction = async (actionType: string) => {
    if (!isAuthenticated) {
      const returnTo = `${location.pathname}${location.search}`;
      navigate(
        `/login?returnTo=${encodeURIComponent(returnTo)}&action=${actionType}`
      );
      return;
    }
    try {
      if (actionType === "addToWishlist") {
        if (!isInWishlist) {
          await dispatch(
            addToWishlist({
              itemId: courseId!,
              itemType: "Course",
            })
          ).unwrap();
          toast.success("Course added to wishlist successfully");
        } else {
          await dispatch(removeFromWishlist(courseId!)).unwrap();
          toast.success("Course removed from wishlist successfully");
        }
        dispatch(fetchWishlist());
      } else if (actionType === "addToCart") {
        if (!isInCart) {
          const result = await dispatch(
            addToCart({ itemId: courseId!, itemType: "Course" })
          ).unwrap();
          toast.success(result.message);
        } else {
          navigate("/cart");
        }
      } else if (actionType === "buyNow") {
        await dispatch(
          addToCart({ itemId: courseId!, itemType: "Course" })
        ).unwrap();
        navigate("/checkout");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentCourse) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Alert severity="info">No course details found.</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {currentCourse.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Rating
              value={currentCourse.reviewStats?.averageRating || 0}
              precision={0.1}
              readOnly
              size="medium"
              sx={{ color: "secondary.main" }}
            />
            <Typography variant="body1" color="text.secondary">
              ({currentCourse.reviewStats?.totalReviews || 0} reviews)
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              mb: 6,
              height: 400,
              overflow: "hidden",
              borderRadius: "12px",
              position: "relative",
            }}
          >
            {currentCourse.introVideoUrl ? (
              <VideoPlayer videoUrl={currentCourse.introVideoUrl} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <PlayCircleOutlineIcon
                  sx={{ fontSize: 60, color: "primary", mb: 2 }}
                />
                <Typography variant="body1">
                  Video preview not available
                </Typography>
              </Box>
            )}
          </Paper>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Course Description
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {currentCourse.description}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              What You Will Learn
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {currentCourse.whatYouWillLearn}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Target Audience
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {currentCourse.targetAudience}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Course Content
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: "8px" }}>
              <List>
                {currentCourse.lessons?.map((lesson, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        <Typography
                          variant="body2"
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {index + 1}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText primary={lesson.title} />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={4}
            sx={{
              borderRadius: "12px",
              position: "sticky",
              top: 20,
            }}
          >
            {currentCourse.featuredImage && (
              <CardMedia
                component="img"
                height="180"
                image={currentCourse.featuredImage}
                alt={currentCourse.title}
              />
            )}
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h5" component="div" color="primary">
                  ₹{currentCourse.price?.toFixed(2)}
                </Typography>
                <Box>
                  <IconButton
                    aria-label={
                      isInWishlist ? "Remove from whishlist" : "Add to wishlist"
                    }
                    onClick={() => handleAuthRequiredAction("addToWishlist")}
                    color="secondary"
                  >
                    {isInWishlist ? <FavoriteIcon /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
              </Box>

              {isEnrolled ? (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{
                    mb: 3,
                    py: 1.5,
                    borderRadius: "8px",
                  }}
                  href={`/courses/${currentCourse._id}/learn`}
                >
                  continue learning
                </Button>
              ) : (
                <React.Fragment>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{
                      mb: 3,
                      py: 1.5,
                      borderRadius: "8px",
                    }}
                    onClick={() => handleAuthRequiredAction("addToCart")}
                  >
                    {isInCart ? "go to cart" : "add to cart"}
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{
                      mb: 3,
                      py: 1.5,
                      borderRadius: "8px",
                    }}
                    onClick={() => handleAuthRequiredAction("buyNow")}
                  >
                    Buy Now
                  </Button>
                </React.Fragment>
              )}

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AccessTimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Duration: {currentCourse.durationHours || 0}hr{" "}
                        {currentCourse.durationMinutes || 0}mins
                      </Typography>
                    }
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                This course includes:
              </Typography>

              <List dense sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {currentCourse.lessons?.length || 0} Video lessons
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Full lifetime access
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mb: 4, mt: 4, boxShadow: 1, borderRadius: 2, p: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom textAlign="center">
          Reviews
        </Typography>

        {isEnrolled && (
          <Box sx={{ mb: 2 }}>
            {userReview ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setReviewModalOpen(true)}
                >
                  Edit Review
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Review
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={() => setReviewModalOpen(true)}
              >
                Write A Review
              </Button>
            )}
          </Box>
        )}
        {reviewsLoading ? (
          <CircularProgress />
        ) : reviewsError ? (
          <Alert severity="error">{reviewsError}</Alert>
        ) : reviews.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">
            No reviews yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {reviews.map((review) => (
              <Grid item xs={12} key={review._id}>
                <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={review.userId?.profileImg}
                        alt={review.userId?.username}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.userId?.username}
                        </Typography>
                        <Rating
                          value={review.rating}
                          readOnly
                          precision={0.5}
                          sx={{ color: "secondary.main" }}
                        />
                      </Box>
                    </Box>

                    <Typography variant="body1" fontWeight="bold" mt={1}>
                      {review.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {review.reviewText}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "8px",
          }}
        >
          <Typography id="review-modal-title" variant="h6" gutterBottom>
            {userReview ? "Edit Review" : "Write a Review"}
          </Typography>
          <form onSubmit={handleSubmit(handleReviewSubmit)}>
            <Box sx={{ mb: 3 }}>
              <Typography component="legend" variant="body2" sx={{ mb: 1 }}>
                Your Rating*
              </Typography>
              <Rating
                name="rating"
                value={Number(ratingValue)}
                size="large"
                sx={{ mb: 2, color: "secondary.main" }}
                onChange={(event, newValue) => {
                  setValue("rating", newValue);
                }}
              />{" "}
              {errors.rating && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.rating.message}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                {...register("title")}
                label="Review Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                placeholder="Summarize your experience"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                {...register("reviewText")}
                label="Your Review"
                multiline
                rows={4}
                fullWidth
                error={!!errors.reviewText}
                helperText={errors.reviewText?.message}
                placeholder="Share your experience to help others"
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                onClick={() => setReviewModalOpen(false)}
                variant="outlined"
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ flex: 1 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your review? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              handleDeleteReview();
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseDetails;

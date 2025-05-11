import React, { useEffect } from "react";
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
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder,
} from "@mui/icons-material";
import { RootState } from "../Store/store";
import { AppDispatch } from "../Store/store";
import { toast } from "react-toastify";
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from "../Features/wishlistSlice";
import { addToCart, fetchCart } from "../Features/cartSlice";
import { fetchBundleDetails } from "../Features/courseBundleSlice";
import { fetchUserProfile } from "../Features/userSlice";

const BundleDetails: React.FC = () => {
  const { bundleId } = useParams<{ bundleId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentBundle, loading, error } = useSelector(
    (state: RootState) => state.bundle
  );
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user
  );

  const { items: wishlistItems } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  const isInWishlist = wishlistItems?.some((wishlistItem) => {
    if (wishlistItem.item && typeof wishlistItem.item === "object") {
      return wishlistItem.item._id === bundleId;
    }
    return false;
  });
  const isInCart = cartItems?.some((cartItem) => {
    if (cartItem.item && typeof cartItem.item === "object") {
      return cartItem.item._id === bundleId;
    }
    return false;
  });

  useEffect(() => {
    if (bundleId) {
      dispatch(fetchBundleDetails(bundleId));
    }
  }, [dispatch, bundleId]);

  useEffect(() => {
    if (isAuthenticated && bundleId) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, bundleId]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);

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
              itemId: bundleId!,
              itemType: "Bundle",
            })
          ).unwrap();

          toast.success("Bundle added to wishlist successfully");
        } else {
          await dispatch(removeFromWishlist(bundleId!)).unwrap();
          toast.success("Bundle removed from wishlist successfully");
        }

        await dispatch(fetchWishlist());
      } else if (actionType === "addToCart") {
        if (!isInCart) {
          const result = await dispatch(
            addToCart({ itemId: bundleId!, itemType: "Bundle" })
          ).unwrap();
          toast.success(result.message);
        } else {
          navigate("/cart");
        }
      } else if (actionType === "buyNow") {
        await dispatch(
          addToCart({ itemId: bundleId!, itemType: "Bundle" })
        ).unwrap();
        navigate("/checkout");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred");
      }
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
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

  if (!currentBundle) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Alert severity="info">No bundle details found.</Alert>
      </Box>
    );
  }

  const totalDurationHours =
    currentBundle.courses?.reduce(
      (total, course) => total + (course.durationHours || 0),
      0
    ) ?? 0;

  const totalDurationMinutes =
    currentBundle.courses?.reduce(
      (total, course) => total + (course.durationMinutes || 0),
      0
    ) ?? 0;

  const adjustedHours =
    totalDurationHours + Math.floor(totalDurationMinutes / 60);
  const adjustedMinutes = totalDurationMinutes % 60;

  const totalPrice = currentBundle.totalPrice ?? 0;
  const discountedPrice = currentBundle.discountedPrice ?? 0;

  const savings = totalPrice - discountedPrice;
  const savingsPercentage = totalPrice > 0 ? (savings / totalPrice) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {currentBundle.title}
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Bundle discount:{" "}
              <strong>{savingsPercentage.toFixed(0)}% OFF</strong>
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {currentBundle.description}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Courses Included
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: "8px" }}>
              {currentBundle.courses?.map((course, index) => (
                <React.Fragment key={course._id}>
                  {index > 0 && <Divider />}
                  <Card sx={{ display: "flex", borderRadius: 0 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 120, height: 80, objectFit: "cover" }}
                      image={course.featuredImage || "/placeholder-image.png"}
                      alt={course.title}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <CardContent sx={{ flex: "1 0 auto", py: 2 }}>
                        <Typography component="div" variant="subtitle1">
                          {course.title}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <AccessTimeIcon
                            fontSize="small"
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {course.durationHours || 0}hr{" "}
                            {course.durationMinutes || 0}mins
                          </Typography>
                          <Typography
                            variant="body2"
                            color="primary"
                            sx={{ ml: "auto" }}
                          >
                            ₹{course.price?.toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </React.Fragment>
              ))}
            </Paper>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Bundle Benefits
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: "8px", p: 2 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Save money with our bundle discount" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Access all courses in the bundle with a single purchase" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Full lifetime access to all bundle content" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Learn at your own pace" />
                </ListItem>
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
            {currentBundle.featuredImage && (
              <CardMedia
                component="img"
                height="180"
                image={currentBundle.featuredImage}
                alt={currentBundle.title}
              />
            )}
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h5" component="div" color="primary">
                    ₹{currentBundle.discountedPrice?.toFixed(2)}
                  </Typography>
                  <Box>
                    <IconButton
                      aria-label={
                        isInWishlist
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      onClick={() => handleAuthRequiredAction("addToWishlist")}
                      color="secondary"
                    >
                      {isInWishlist ? <FavoriteIcon /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                  }}
                >
                  ₹{currentBundle.totalPrice?.toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "success.main",
                    fontWeight: "bold",
                    mt: 0.5,
                  }}
                >
                  Save ₹{savings.toFixed(2)} ({savingsPercentage.toFixed(0)}%)
                </Typography>
              </Box>
              {user.enrolledBundles &&
              user.enrolledBundles.some(
                (bundle) =>
                  bundle.bundleId === bundleId ||
                  (typeof bundle.bundleId === "object" &&
                    (bundle.bundleId as { _id: string })._id === bundleId)
              ) ? (
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
                  onClick={handleGoToDashboard}
                >
                  Continue Learning
                </Button>
              ) : (
                <>
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
                    {isInCart ? "Go to cart" : "Add to cart"}
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
                </>
              )}

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AccessTimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Total Duration: {adjustedHours}hr {adjustedMinutes}mins
                      </Typography>
                    }
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                This bundle includes:
              </Typography>

              <List dense sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {currentBundle.courses?.length || 0} Courses
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
                        {currentBundle.courses?.reduce(
                          (total, course) =>
                            total + (course.lessons?.length || 0),
                          0
                        )}{" "}
                        Video lessons
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
    </Container>
  );
};

export default BundleDetails;

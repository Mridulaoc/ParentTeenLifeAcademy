import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { fetchWishlist, removeFromWishlist } from "../Features/wishlistSlice";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import { addToCart } from "../Features/cartSlice";
import { useNavigate } from "react-router-dom";
import { ICourseBundle } from "../Types/courseBundleTypes";
import { ICourse } from "../Types/courseTypes";

const WishlistPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  const navigate = useNavigate();

  const handleRemoveFromWishlist = async (itemId: string) => {
    await dispatch(removeFromWishlist(itemId));
    await dispatch(fetchWishlist());
  };

  const handleAddToCart = async (
    itemId: string,
    itemType: "Course" | "Bundle"
  ) => {
    await dispatch(addToCart({ itemId, itemType })).unwrap();
    navigate("/cart");
    await dispatch(removeFromWishlist(itemId));
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

  if (!items?.length) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "40vh",
            }}
          >
            <Alert severity="info" sx={{ mb: 2 }}>
              Your wishlist is empty
            </Alert>
            <Button variant="contained" color="primary" href="/courses">
              Browse Courses
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wishlist
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {items.length} {items.length === 1 ? "item" : "items"} in your
          wishlist
        </Typography>

        <Grid container spacing={3}>
          {items.map((wishlisItem) => {
            const item = wishlisItem.item;
            return (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={item.featuredImage || "/placeholder-image.jpg"}
                    alt={item.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {item.title}
                    </Typography>

                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      {wishlisItem.itemType === "Bundle" ? (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                textDecoration: "line-through",
                                color: "text.secondary",
                              }}
                            >
                              {(item as ICourseBundle).totalPrice?.toFixed(2)}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              ₹
                              {(item as ICourseBundle).discountedPrice?.toFixed(
                                2
                              )}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="success.main">
                            Save ₹
                            {(
                              (item as ICourseBundle).totalPrice -
                              (item as ICourseBundle).discountedPrice
                            ).toFixed(2)}{" "}
                            (
                            {(
                              (((item as ICourseBundle).totalPrice -
                                (item as ICourseBundle).discountedPrice) /
                                (item as ICourseBundle).totalPrice) *
                              100
                            ).toFixed(0)}
                            %)
                          </Typography>
                        </>
                      ) : (
                        `₹${(item as ICourse).price?.toFixed(2)}`
                      )}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCartIcon />}
                      size="small"
                      onClick={() =>
                        handleAddToCart(
                          item._id,
                          wishlisItem.itemType as "Course" | "Bundle"
                        )
                      }
                    >
                      Add to Cart
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveFromWishlist(item._id)}
                      aria-label="remove from wishlist"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Container>
  );
};

export default WishlistPage;

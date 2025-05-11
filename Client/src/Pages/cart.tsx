import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { fetchCart, removeFromCart } from "../Features/cartSlice";
import {
  Button,
  Box,
  List,
  ListItem,
  Typography,
  IconButton,
  Divider,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { RemoveShoppingCart as RemoveShoppingCartIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { fetchWishlist } from "../Features/wishlistSlice";
import { ICourseBundle } from "../Types/courseBundleTypes";
import { ICourse } from "../Types/courseTypes";

const CartPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, cartTotal } = useSelector(
    (state: RootState) => state.cart
  );

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemoveFromCart = async (itemId: string, itemType: string) => {
    await dispatch(removeFromCart({ itemId, itemType }));
    await dispatch(fetchCart());
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Alert severity="info">Your cart is empty</Alert>
      </Box>
    );
  }

  return (
    <Paper>
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Cart
        </Typography>

        <List sx={{ mb: 4 }}>
          {items.map((cartItem) => {
            const item = cartItem.item;
            const itemType = cartItem.itemType;
            return (
              <ListItem
                key={item._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      marginRight: 16,
                    }}
                  />
                  <Box>
                    <Typography variant="h6">{item.title}</Typography>
                    {itemType === "Bundle" ? (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              textDecoration: "line-through",
                              mr: 1,
                              fontSize: "0.875rem",
                            }}
                          >
                            ₹{(item as ICourseBundle).totalPrice?.toFixed(2)}
                          </Typography>
                          <Typography
                            component="span"
                            color="primary"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            ₹
                            {(item as ICourseBundle).discountedPrice.toFixed(2)}
                          </Typography>
                          <Typography
                            component="span"
                            color="success.main"
                            sx={{ ml: 1, fontSize: "0.75rem" }}
                          >
                            (
                            {Math.round(
                              (((item as ICourseBundle).totalPrice -
                                (item as ICourseBundle).discountedPrice) /
                                (item as ICourseBundle).totalPrice) *
                                100
                            )}
                            % OFF)
                          </Typography>
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" color="primary">
                        ₹{(item as ICourse).price?.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton
                  onClick={() =>
                    handleRemoveFromCart(
                      item._id,
                      itemType as "Bundle" | "Course"
                    )
                  }
                  color="error"
                >
                  <RemoveShoppingCartIcon />
                </IconButton>
              </ListItem>
            );
          })}
          <Divider />
        </List>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
            <Typography variant="h6" gutterBottom>
              Total: ₹{cartTotal}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ py: 1.5 }}
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CartPage;

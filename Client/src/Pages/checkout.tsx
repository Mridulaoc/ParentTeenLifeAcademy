import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppDispatch, RootState } from "../Store/store";

import {
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Collapse,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  cancelPayment,
  createPaymentOrder,
  failPayment,
  fetchPaymentKey,
  removeCoupon,
  validateCoupon,
  verifyPayment,
} from "../Features/orderSlice";
import { toast } from "react-toastify";
import {
  Cancel,
  CheckCircle,
  Discount,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.object({
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
  couponCode: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const GST_RATE = 0.18;

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.user);
  const {
    items,
    loading: cartLoading,
    error: cartError,
    cartTotal,
  } = useSelector((state: RootState) => state.cart);
  const {
    key,
    error: paymentError,
    loading: paymentLoading,
    coupon,
    couponLoading,
    couponError,
  } = useSelector((state: RootState) => state.order);

  const [activeStep, setActiveStep] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCouponField, setShowCouponField] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const navigate = useNavigate();

  const subtotal = cartTotal || 0;
  const discount = coupon
    ? coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue
    : 0;
  const discountedSubtotal = subtotal - discount;
  const gstAmount = discountedSubtotal * GST_RATE;
  const finalTotal = discountedSubtotal + gstAmount;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
      couponCode: "",
    },
  });

  useEffect(() => {
    dispatch(fetchPaymentKey());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setValue("fullName", user.firstName + "  " + user.lastName || "");
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
    }
  }, [user, setValue]);

  const handleBack = () => {
    navigate("/cart");
  };

  const handleAddressSubmit = () => {
    setActiveStep(1);
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;

    try {
      await dispatch(validateCoupon(couponCode)).unwrap();
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to apply coupon");
    }
  };

  const handleCouponRemove = async () => {
    try {
      await dispatch(removeCoupon());
      setCouponCode("");
      toast.success("Coupon removed");
    } catch (error) {
      toast.error("Failed to remove coupon");
    }
  };

  const handlePayment = async (data: CheckoutFormData) => {
    if (isCancelling || paymentLoading) return;
    try {
      const orderData = {
        amount: finalTotal * 100,
        currency: "INR",
        billingAddress: `${data.address.line1}, ${data.address.line2 || ""}, ${
          data.address.city
        }, ${data.address.state} - ${data.address.pincode}`,
        couponCode: coupon ? coupon.code : null,
        subtotal: subtotal,
        discount: discount,
        tax: gstAmount,
      };

      const response = await dispatch(createPaymentOrder(orderData)).unwrap();

      const orderId = response.orderId;

      const options = {
        key,
        amount: finalTotal * 100,
        currency: "INR",
        name: "Parent TeenLife Academy",
        description: "Course Purchase",
        order_id: orderId,
        handler: async function (response: any) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            response;
          try {
            const result = await dispatch(
              verifyPayment({
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
              })
            ).unwrap();

            toast.success(result.message || "Payment Successful");
            rzp.close();
            navigate(
              result.redirectedTo ||
                `/paymentSuccess?reference=${razorpay_payment_id}`
            );
          } catch (error) {
            const errorMessage =
              error.message || "Payment verification failed. Please try again.";
            toast.error(errorMessage);
            const redirectedTo =
              error.redirectedTo ||
              `/payment-failed?orderId=${orderId}&error=verification_failed`;
            rzp.close();
            navigate(redirectedTo);
          }
        },
        modal: {
          escape: false,
          confirm_close: true,
          ondismiss: async function (event: any) {
            if (isCancelling) return;
            setIsCancelling(true);

            try {
              await dispatch(
                cancelPayment({ orderId, reason: "payment_cancelled" })
              ).unwrap();
              toast.success("Payment Cancelled");
              rzp.close();
              navigate(`/payment-cancelled?orderId=${orderId}`);
            } catch (error) {
              toast.error("Error cancelling payment");
              rzp.close();
              navigate(`/payment-cancelled?orderId=${orderId}`);
            } finally {
              setIsCancelling(false);
            }
          },
        },

        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: "#11154F",
        },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", async function (response: any) {
        try {
          rzp.close();
          const errorMessage =
            response.error.description || "Payment failed. Please try again.";
          await dispatch(failPayment(orderId)).unwrap();
          toast.error(errorMessage);

          navigate(
            `/payment-failed?orderId=${orderId}&error=${encodeURIComponent(
              errorMessage
            )}`
          );
        } catch (error) {
          if (rzp) rzp.close();
          toast.error("Error processing payment failure");
          navigate(`/payment-failed?orderId=${orderId}&error=processing_error`);
        }
      });

      rzp.open();
    } catch (error) {
      toast.error("Error initiating payment");
      navigate(`/payment-failed?error=initiation_error`);
    }
  };

  if (cartLoading) {
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

  if (cartError) {
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
    <Paper sx={{ p: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Billing Information</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment</StepLabel>
        </Step>
      </Stepper>

      {activeStep === 0 ? (
        <form onSubmit={handleSubmit(handleAddressSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Billing Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address.line1"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address Line 1"
                    fullWidth
                    error={!!errors.address?.line1}
                    helperText={errors.address?.line1?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address.line2"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address Line 2 (Optional)"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    error={!!errors.address?.city}
                    helperText={errors.address?.city?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="address.state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    error={!!errors.address?.city}
                    helperText={errors.address?.city?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="address.country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Country"
                    fullWidth
                    error={!!errors.address?.city}
                    helperText={errors.address?.city?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="address.pincode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Pincode"
                    fullWidth
                    error={!!errors.address?.pincode}
                    helperText={errors.address?.pincode?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button variant="outlined" onClick={handleBack}>
                  Back to Cart
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!isValid}
                >
                  Continue to Payment
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>

          <Box sx={{ mb: 3 }}>
            {items.map((cartItem) => {
              const item = cartItem.item;
              const itemType = cartItem.itemType;
              return (
                <Box
                  key={item._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        marginRight: 16,
                      }}
                    />
                    <Typography variant="body1">{item.title}</Typography>
                  </Box>
                  <Typography variant="body1" color="primary">
                    ₹
                    {itemType === "Bundle"
                      ? item.discountedPrice?.toFixed(2)
                      : item.price?.toFixed(2)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1">Have a coupon?</Typography>
              <IconButton onClick={() => setShowCouponField(!showCouponField)}>
                {showCouponField ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </Box>

            <Collapse in={showCouponField || !!coupon}>
              <Box sx={{ mb: 2, display: "flex", alignItems: "flex-start" }}>
                {!coupon ? (
                  <>
                    <TextField
                      size="small"
                      label="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      sx={{ mr: 2, flexGrow: 1 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Discount fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      disabled={couponLoading}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleCouponApply}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? <CircularProgress size={24} /> : "Apply"}
                    </Button>
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      border: "1px solid #ccc",
                      borderRadius: 1,
                      width: "100%",
                      bgcolor: "success.light",
                      color: "success.contrastText",
                    }}
                  >
                    <CheckCircle sx={{ mr: 1 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {coupon.code}
                      </Typography>
                      <Typography variant="caption">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% off`
                          : `₹${coupon.discountValue} off`}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={handleCouponRemove}
                      sx={{ color: "inherit" }}
                    >
                      <Cancel />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {couponError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {couponError}
                </Alert>
              )}
            </Collapse>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1">₹{subtotal.toFixed(2)}</Typography>
            </Box>
            {discount > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                  color: "success.main",
                }}
              >
                <Typography variant="body1">Discount</Typography>
                <Typography variant="body1">-₹{discount.toFixed(2)}</Typography>
              </Box>
            )}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body1">GST (18%)</Typography>
              <Typography variant="body1">₹{gstAmount.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                mt: 2,
              }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ₹{finalTotal.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {paymentError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {paymentError}
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" onClick={() => setActiveStep(0)}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit(handlePayment)}
              disabled={paymentLoading}
              sx={{ minWidth: 200 }}
            >
              {paymentLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Pay ₹" + finalTotal.toFixed(2)
              )}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CheckoutPage;

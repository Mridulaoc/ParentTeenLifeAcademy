import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Pagination,
  Modal,
  Grid,
  Divider,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  cancelPayment,
  failPayment,
  fetchPaymentKey,
  fetchUserOrders,
  requestRefund,
  retryPayment,
  verifyPayment,
} from "../Features/orderSlice";
import { RootState, AppDispatch } from "../Store/store";
import moment from "moment";
import { IOrder } from "../Types/orderTypes";
import { Close, Replay } from "@mui/icons-material";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OrderHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading, error, total, key } = useSelector(
    (state: RootState) => state.order
  );
  const { user } = useSelector((state: RootState) => state.user);

  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchUserOrders({ page, limit }));
    dispatch(fetchPaymentKey());
  }, [dispatch, page, limit]);

  const handleViewDetails = (order: IOrder) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const isRefundEligible = (order: IOrder) => {
    if (order.paymentStatus !== "Payment Successfull") return false;

    const hasBundleItem = order.items?.some(
      (item) => item.itemType === "Bundle"
    );
    if (!hasBundleItem) return false;

    const orderDate = new Date(order.createdAt!);
    const currentDate = new Date();
    const refundWindowMs = 7 * 24 * 60 * 60 * 1000;
    const isWithinRefundWindow =
      currentDate.getTime() - orderDate.getTime() <= refundWindowMs;

    return isWithinRefundWindow;
  };

  const handleRefundRequest = async (orderId: string) => {
    if (isRefunding || loading) return;
    setIsRefunding(true);
    try {
      await dispatch(requestRefund(orderId)).unwrap();
      toast.success("Refund request submitted successfully");
      dispatch(fetchUserOrders({ page, limit }));
    } catch (error) {
      toast.error("Failed to process refund request");
    } finally {
      setIsRefunding(false);
    }
  };
  const handleRetryPayment = async (orderId: string) => {
    if (isRetrying || loading || !orderId) return;
    setIsRetrying(true);
    try {
      const response = await dispatch(retryPayment(orderId)).unwrap();
      const newOrderId = response.orderId;
      const amount = response.amount!;

      const options = {
        key,
        amount,
        currency: "INR",
        name: "Parent TeenLife Academy",
        description: "Course Purchase Retry",
        order_id: newOrderId,
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
          name: user.firstName + " " + user.lastName ? user.lastName : "",
          email: user.email,
          contact: user.phone ? user.phone : "",
        },
        theme: {
          color: "#11154F",
        },
      };
      const rzp = new Razorpay(options);
      rzp.on("payment.failed", async function (response: any) {
        try {
          const errorMessage =
            response.error.description || "Payment failed. Please try again.";
          await dispatch(failPayment(orderId)).unwrap();
          toast.error(errorMessage);
          rzp.close();
          navigate(
            `/payment-failed?orderId=${orderId}&error=${encodeURIComponent(
              errorMessage
            )}`
          );
        } catch (error) {
          toast.error("Error processing payment failure");
          rzp.close();
          navigate(`/payment-failed?orderId=${orderId}&error=processing_error`);
        }
      });
      rzp.open();
    } catch (error) {
      toast.error("Error initiating payment");
      navigate(`/payment-failed?error=initiation_error`);
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
        <Typography variant="h5">Your Order History</Typography>
      </Box>
      {orders.length === 0 ? (
        <Typography variant="h6" py={3}>
          No orders found
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell align="center" colSpan={3}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow hover key={order._id}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>
                    {moment(order.createdAt).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell>{order.items?.length}</TableCell>
                  <TableCell>
                    {order.subtotal - order.discount + order.tax}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentStatus}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      {order.paymentStatus === "Payment Successfull" && (
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(order)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {order.paymentStatus === "Payment Failed" && (
                        <Tooltip title="Retry Payment">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleRetryPayment(order.orderId)}
                          >
                            <Replay />
                          </IconButton>
                        </Tooltip>
                      )}
                      {isRefundEligible(order) &&
                        order.status !== "Refund Requested" && (
                          <Button
                            onClick={() => handleRefundRequest(order.orderId)}
                          >
                            Refund
                          </Button>
                        )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="center" p={3}>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          siblingCount={0}
          boundaryCount={0}
        />
      </Box>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="order-detail-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 800,
            maxHeight: "90vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 0,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {selectedOrder && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <Typography variant="h6">
                  Order #{selectedOrder.orderId}
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseModal}
                  sx={{ color: "white" }}
                >
                  <Close />
                </IconButton>
              </Box>

              <Box sx={{ p: 5, overflow: "auto" }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Order Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          Order Date
                        </Typography>
                        <Typography variant="body1">
                          {moment(selectedOrder.createdAt).format(
                            "YYYY-MM-DD HH:mm"
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedOrder.status}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          Payment Status
                        </Typography>
                        <Chip
                          label={selectedOrder.paymentStatus}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">
                        Payment Breakdown:
                      </Typography>
                      <Box ml={2}>
                        <Typography>
                          Subtotal: ₹{selectedOrder?.subtotal}
                        </Typography>
                        <Typography>
                          Discount: ₹{selectedOrder?.discount}
                        </Typography>
                        <Typography>Tax: ₹{selectedOrder?.tax}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography fontWeight="bold">
                          Total: ₹
                          {selectedOrder
                            ? selectedOrder.subtotal -
                              selectedOrder.discount +
                              selectedOrder.tax
                            : 0}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Order Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items!.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography variant="body2">
                                      {item.title}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>₹{item.price.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Billing Address
                    </Typography>
                    {selectedOrder.billingAddress && (
                      <Typography variant="body1">
                        {selectedOrder.billingAddress}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Payment Information
                    </Typography>
                    {selectedOrder.orderId && (
                      <Typography variant="body2">
                        <strong>Transaction ID:</strong> {selectedOrder.orderId}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={handleCloseModal}
                  variant="contained"
                  color="primary"
                >
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default OrderHistory;

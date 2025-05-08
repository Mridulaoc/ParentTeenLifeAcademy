import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { fetchAllOrders, processRefund } from "../Features/orderSlice";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import { Close, CheckCircle, Cancel } from "@mui/icons-material";
import { toast } from "react-toastify";
import { IOrder } from "../Types/orderTypes";

const OrderManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, total } = useSelector(
    (state: RootState) => state.order
  );

  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const limit = 5;

  useEffect(() => {
    dispatch(fetchAllOrders({ page, limit }));
  }, [dispatch, page, limit]);

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setRefundReason("");
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleRefundProcess = (orderId: string) => {
    dispatch(processRefund(orderId))
      .unwrap()
      .then(() => {
        toast.success("Refund request accepted");
        handleCloseModal();
        dispatch(fetchAllOrders({ page, limit }));
      })
      .catch((err) => {
        toast.error(err.message || "Failed to process refund");
      });
  };

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      case "refund requested":
        return "secondary";
      case "refunded":
        return "default";
      default:
        return "default";
    }
  };

  const getPaymentStatusChipColor = (status: string) => {
    if (status.includes("Successfull") || status.includes("Successful"))
      return "success";
    if (status.includes("Failed")) return "error";
    if (status.includes("Pending")) return "warning";
    if (status.includes("Cancelled")) return "default";
    if (status.includes("Refunded")) return "info";
    return "default";
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
        <Typography variant="h5">Order Management</Typography>
      </Box>

      {orders && orders.length === 0 ? (
        <Box p={3}>
          <Typography variant="h6" align="center">
            No orders found
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow hover key={order._id}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>
                    {order.userId?.firstName} {order.userId?.lastName}
                  </TableCell>
                  <TableCell>
                    {moment(order.createdAt).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell>₹{order.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      color={getStatusChipColor(order.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentStatus}
                      size="small"
                      color={getPaymentStatusChipColor(order.paymentStatus)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(order)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
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
        />
      </Box>

      {/* Order Details Modal */}
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

              <Box
                sx={{ p: 3, overflow: "auto", maxHeight: "calc(90vh - 150px)" }}
              >
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
                          Customer
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.userId?.firstName}{" "}
                          {selectedOrder.userId?.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          Email
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ wordBreak: "break-all" }}
                        >
                          {selectedOrder.userId?.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="textSecondary">
                          Total Amount
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ₹{selectedOrder.amount.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      mt={2}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="textSecondary">
                        Order Status
                      </Typography>
                    </Box>
                    <Box
                      mt={2}
                      display="flex"
                      flexDirection="row"
                      justifyContent="space-between"
                    >
                      <Chip
                        label={selectedOrder.paymentStatus}
                        color={getPaymentStatusChipColor(
                          selectedOrder.paymentStatus
                        )}
                        sx={{ mt: 1 }}
                      />
                      {selectedOrder.status === "Refund Requested" && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<CheckCircle />}
                          onClick={() =>
                            handleRefundProcess(selectedOrder.orderId)
                          }
                        >
                          Accept Refund Request
                        </Button>
                      )}
                    </Box>
                    {selectedOrder.paymentId && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Payment ID:</strong> {selectedOrder.paymentId}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Order Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Price</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.title}</TableCell>
                              <TableCell>{item.itemType}</TableCell>
                              <TableCell align="right">
                                ₹{item.price.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Billing Address
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.billingAddress ||
                        "No billing address provided"}
                    </Typography>
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

export default OrderManagement;

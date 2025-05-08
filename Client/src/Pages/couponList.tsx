import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Paper,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import moment from "moment";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Types/storeTypes";
import { deactivateCoupon, fetchCoupons } from "../Features/couponSlice";
import { useNavigate } from "react-router-dom";
import { Add, Edit, ToggleOff, ToggleOn } from "@mui/icons-material";
import { toast } from "react-toastify";

const CouponManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { coupons } = useSelector((state: RootState) => state.coupon);
  const navigate = useNavigate();

  const page = 1;
  const limit = 5;

  useEffect(() => {
    dispatch(fetchCoupons({ page, limit }));
  }, [dispatch]);

  const handleEditCoupon = (id: string) => {
    navigate(`/admin/dashboard/coupons/edit/${id}`);
  };

  const handleDeleteCoupon = async (id: string, isActive: boolean) => {
    try {
      const result = await dispatch(
        deactivateCoupon({ id: id, isActive: !isActive })
      );
      if (deactivateCoupon.fulfilled.match(result)) {
        const successMessage = result.payload.message;
        toast.success(successMessage);
      } else if (deactivateCoupon.rejected.match(result)) {
        const errorMessage = result.payload?.message;
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Failed to update coupon:", error);
    }
  };

  const handleCreateCoupon = () => {
    navigate(`/admin/dashboard/coupons/add`);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box p={3} sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" gutterBottom>
          Coupon Management
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleCreateCoupon}
        >
          Create New Coupon
        </Button>
      </Box>
      {coupons && coupons.length > 0 ? (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell colSpan={2} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id} hover>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell>{coupon.discountType}</TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `$${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>
                    {moment(coupon.expiryDate).format("LL")}
                  </TableCell>
                  <TableCell>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Edit Coupon">
                        <IconButton
                          size="small"
                          onClick={() => handleEditCoupon(coupon._id)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate Coupon">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleDeleteCoupon(coupon._id, coupon.isActive!)
                          }
                        >
                          {coupon.isActive ? (
                            <ToggleOn color="primary" />
                          ) : (
                            <ToggleOff color="action" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" sx={{ textAlign: "center", margin: "5rem" }}>
          No Coupons Found
        </Typography>
      )}
    </Paper>
  );
};

export default CouponManagement;

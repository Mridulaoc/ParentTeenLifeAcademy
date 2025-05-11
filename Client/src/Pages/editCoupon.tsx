import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { AppDispatch, RootState } from "../Store/store";
import { fetchCouponById, updateCoupon } from "../Features/couponSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code must be at most 20 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Coupon code must contain only uppercase letters and numbers"
    ),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z
    .number()
    .positive("Discount value must be positive")
    .refine((val) => val <= 100, {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    }),
  expiryDate: z.string().refine(
    (dateStr) => {
      const date = new Date(dateStr);
      return date > new Date();
    },
    {
      message: "Expiry date must be in the future",
    }
  ),
  isActive: z.boolean().optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

const EditCoupon: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, coupon } = useSelector((state: RootState) => state.coupon);

  const {
    control,
    handleSubmit,

    watch,
    reset,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 0,
      expiryDate: "",
    },
  });

  const discountType = watch("discountType");

  useEffect(() => {
    if (id) {
      dispatch(fetchCouponById(id)).unwrap();
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (coupon && Object.keys(coupon).length > 0) {
      let formattedDate = "";
      if (coupon.expiryDate) {
        const date = new Date(coupon.expiryDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split("T")[0];
        }
      }

      reset({
        code: coupon.code || "",
        discountType: coupon.discountType === "fixed" ? "fixed" : "percentage",
        discountValue: coupon.discountValue || 0,
        expiryDate: formattedDate,
        isActive: coupon.isActive,
      });
    }
  }, [coupon, reset, watch]);

  const onSubmit = async (data: CouponFormValues) => {
    try {
      if (id) {
        const expiryDate = new Date(data.expiryDate);

        const result = await dispatch(
          updateCoupon({
            id,
            couponData: {
              ...data,
              expiryDate,
            },
          })
        );

        if (updateCoupon.fulfilled.match(result)) {
          const successMessage =
            result.payload?.message || "Coupon updated successfully";
          toast.success(successMessage);
          navigate("/admin/dashboard/coupons");
        } else if (updateCoupon.rejected.match(result)) {
          const errorMessage =
            result.payload?.message || "Updating coupon failed";
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      toast.error("An error occurred while updating coupon.");
    }
  };

  return (
    <Card>
      <CardHeader title="Edit Coupon" />
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Coupon Code"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    placeholder="e.g. WORKSHOP101"
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.discountType}>
                    <InputLabel id="discount-type-label">
                      Discount Type
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="discount-type-label"
                      label="Discount Type"
                    >
                      <MenuItem value="percentage">Percentage (%)</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                    </Select>
                    {errors.discountType && (
                      <FormHelperText>
                        {errors.discountType.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="discountValue"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Discount Value"
                    type="number"
                    fullWidth
                    error={!!errors.discountValue}
                    helperText={errors.discountValue?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {discountType === "fixed" ? "₹" : ""}
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {discountType === "percentage" ? "%" : ""}
                        </InputAdornment>
                      ),
                    }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Expiry Date"
                    type="date"
                    fullWidth
                    error={!!errors.expiryDate}
                    helperText={errors.expiryDate?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/admin/dashboard/coupons")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Update Coupon"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EditCoupon;

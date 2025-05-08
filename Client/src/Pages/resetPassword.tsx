import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { clearResetPasswordUserId, resetPassword } from "../Features/userSlice";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormInput = z.infer<typeof passwordSchema>;
export const ResetPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { loading } = useSelector((state: RootState) => state.user);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormInput>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    return () => {
      dispatch(clearResetPasswordUserId());
    };
  }, [dispatch]);

  const onSubmit = async (data: PasswordFormInput) => {
    if (!userId) return;

    const resultAction = await dispatch(
      resetPassword({ userId, password: data.password })
    );

    if (resetPassword.fulfilled.match(resultAction)) {
      toast.success("Password reset successfully!");
      navigate("/login");
    } else if (resetPassword.rejected.match(resultAction)) {
      toast.error(resultAction.payload?.message || "Failed to reset password");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 400, mx: "auto", p: 3 }}
    >
      <Typography variant="h5" mb={2}>
        Reset Password
      </Typography>
      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label="New Password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label="Confirm Password"
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Reset Password"}
      </Button>
    </Box>
  );
};

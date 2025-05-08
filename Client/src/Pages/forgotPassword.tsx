import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../Features/userSlice";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";
const emailSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
});

type EmailFormInput = z.infer<typeof emailSchema>;

export const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, resetPasswordUserId } = useSelector(
    (state: RootState) => state.user
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormInput>({
    resolver: zodResolver(emailSchema),
  });

  useEffect(() => {
    if (resetPasswordUserId) {
      toast.success("OTP sent to your email!");

      navigate(`/verify-otp/${resetPasswordUserId}`);
    }
  }, [resetPasswordUserId, navigate]);

  const onSubmit = async (data: EmailFormInput) => {
    const resultAction = await dispatch(forgotPassword(data.email));
    if (forgotPassword.rejected.match(resultAction)) {
      toast.error(resultAction.payload?.message || "Failed to send OTP");
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: "2rem",
        borderRadius: "1rem",
        textAlign: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ maxWidth: 400, mx: "auto", p: 3 }}
      >
        <Typography variant="h5" mb={2}>
          Forgot Password
        </Typography>
        <Controller
          name="email"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
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
          {loading ? <CircularProgress size={24} /> : "Send OTP"}
        </Button>
      </Box>
    </Paper>
  );
};

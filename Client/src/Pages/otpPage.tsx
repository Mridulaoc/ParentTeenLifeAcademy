import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { verifyOtp, resendOtp } from "../Features/otpSlice";
import { toast } from "react-toastify";

import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const OtpPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timer, setTimer] = useState<number>(60);
  const [otpInvalid, setOtpInvalid] = useState<boolean>(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { loading } = useSelector((state: RootState) => state.otp);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) toast.error("Cannot eneter except numbers");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      toast.error("Please enter the complete OTP");
      return;
    }
    if (userId) {
      try {
        const resultAction = await dispatch(
          verifyOtp({ userId, otp: enteredOtp })
        );
        if (verifyOtp.fulfilled.match(resultAction)) {
          toast.success("Email verified successfully!");
          navigate("/login");
        } else if (verifyOtp.rejected.match(resultAction)) {
          setOtpInvalid(true);
          toast.error(resultAction.payload?.message || "Invalid OTP");
        }
      } catch (error) {
        if (typeof error === "string") {
          toast.error(error);
        }
      }
    }
  };

  const handleResend = () => {
    if (userId) {
      dispatch(resendOtp({ userId }));
      setTimer(60);
      setOtp(["", "", "", ""]);
      setOtpInvalid(false);
      inputRefs.current[0]?.focus();
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
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        sx={{ mt: 4 }}
      >
        <Typography variant="h4" gutterBottom>
          Enter OTP
        </Typography>

        <Box display="flex" gap={1}>
          {otp.map((digit, index) => (
            <TextField
              key={index}
              id={`otp-${index}`}
              type="text"
              variant="outlined"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              inputRef={(el) => (inputRefs.current[index] = el)}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: "center",
                  fontSize: "1rem",
                  width: "2rem",
                  height: "2rem",
                },
              }}
            />
          ))}
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerify}
            disabled={loading || timer === 0}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>

          {timer === 0 ? (
            <Button variant="text" color="secondary" onClick={handleResend}>
              Resend OTP
            </Button>
          ) : otpInvalid && timer > 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={1}
            >
              <Typography variant="body1" color="textSecondary">
                Time remaining: {timer}s
              </Typography>
              <Button variant="text" color="secondary" onClick={handleResend}>
                Resend OTP
              </Button>
            </Box>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Time remaining: {timer}s
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default OtpPage;

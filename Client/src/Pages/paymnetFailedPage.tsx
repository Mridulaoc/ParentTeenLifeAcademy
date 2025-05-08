import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../Store/store";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("orderId");

  const { loading: paymentLoading, error: paymentError } = useSelector(
    (state: RootState) => state.order
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 600, width: "100%" }}>
        <Typography variant="h4" gutterBottom align="center">
          Payment Failed
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          We're sorry, but your payment for order ID <strong>{orderId}</strong>{" "}
          could not be processed.
        </Typography>
        {paymentError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {paymentError}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/checkout")}
            disabled={paymentLoading || !orderId}
            sx={{ minWidth: 200 }}
          >
            {paymentLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Try Again"
            )}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/cart")}
          >
            Back to Cart
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentFailedPage;

import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PaymentCancelledPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 4, mb: 4, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Payment Cancelled
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Your payment has been cancelled. No charges have been made.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate("/checkout")}>
          Try Again
        </Button>
        <Button variant="contained" onClick={() => navigate("/cart")}>
          Return to Cart
        </Button>
      </Box>
    </Paper>
  );
};

export default PaymentCancelledPage;

import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Divider,
  CardContent,
  Avatar,
  Paper,
  Card,
} from "@mui/material";

import { CheckCircle, Receipt, School } from "@mui/icons-material";
// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../Store/store";
// import { updatePaymentStatus } from "../Features/orderSlice";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();
  const query = new URLSearchParams(location.search);
  const referenceId = query.get("reference");
  // const orderId = query.get("orderId");

  // useEffect(() => {
  //   // When the success page loads, confirm the payment
  //   if (orderId) {
  //     dispatch(
  //       updatePaymentStatus({
  //         orderId,
  //         status: "success",
  //       })
  //     );
  //   }
  // }, [dispatch, orderId]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <CheckCircle
          sx={{
            fontSize: 50,
            color: "success.main",
            mb: 2,
          }}
        />

        <Typography variant="h5" align="center" gutterBottom>
          Payment Successful!
        </Typography>

        <Typography variant="body1" align="center" color="text.secondary">
          Thank you for your purchase. Your courses have been successfully
          enrolled and are now available in your dashboard.
        </Typography>

        <Divider flexItem sx={{ my: 2 }} />

        <Card
          sx={{
            width: "100%",
            bgcolor: "grey.50",
            borderRadius: 1.5,
            my: 2,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <Receipt />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Payment Reference ID
              </Typography>
              <Typography variant="h6" fontFamily="monospace">
                {referenceId}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" align="center">
          A confirmation email has been sent to your registered email address
          with all the details of your purchase.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<School />}
          onClick={handleGoToDashboard}
          sx={{
            mt: 2,
            borderRadius: 2,
            py: 1.5,
            px: 4,
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          Go to My Dashboard
        </Button>

        <Button
          variant="text"
          color="inherit"
          onClick={() => navigate("/")}
          sx={{ mt: 1 }}
        >
          Return to Homepage
        </Button>
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;

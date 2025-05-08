import { Box } from "@mui/material";
import Navbar from "./navbar";
import { Outlet } from "react-router-dom";
import Footer from "./footer";

export function MainLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}

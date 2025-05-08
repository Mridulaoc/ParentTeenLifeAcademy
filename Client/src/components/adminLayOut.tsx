import { Box } from "@mui/material";

import { Outlet } from "react-router-dom";
import AdminNavbar from "./adminNavbar";
import Footer from "./footer";
export function AdminLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AdminNavbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}

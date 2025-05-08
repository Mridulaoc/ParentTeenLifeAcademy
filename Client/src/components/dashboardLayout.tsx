import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import ProfileBar from "./profileBar";
import { useSelector } from "react-redux";
import { RootState } from "../Store/store";
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Menu } from "@mui/icons-material";

export function DashboardLayout() {
  const { user } = useSelector((state: RootState) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <ProfileBar />

        {/* mobile menu  */}
        {isMobile && (
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ m: 1, display: { md: "none" } }}
          >
            <Menu />
          </IconButton>
        )}
      </Box>
      {/* desktop sidebar  */}
      <Box sx={{ display: "flex", width: "100%" }}>
        {!isMobile && (
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Sidebar user={user} />
          </Box>
        )}

        {/* Drawer for mobile */}
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={toggleSidebar}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: 240 },
          }}
        >
          <Sidebar user={user} onItemClick={toggleSidebar} />
        </Drawer>
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 3 },
            width: "100%",
            overflowX: "hidden",
            pb: isMobile ? 7 : 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

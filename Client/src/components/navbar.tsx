import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
} from "@mui/material";
import { AppDispatch, RootState } from "../Store/store";
import { fetchUserProfile, logout } from "../Features/userSlice";
import logo from "/logo.png";
import {
  Close,
  Favorite,
  Menu,
  Notifications,
  ShoppingBag,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { clearCart, fetchCart } from "../Features/cartSlice";
import { fetchWishlist } from "../Features/wishlistSlice";
import { fetchUnreadCount } from "../Features/notificationSlice";
import notificationSocketService from "../Services/notificationSocketService";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user
  );

  const cartItemCount = useSelector(
    (state: RootState) => state.cart?.items?.length || 0
  );
  const wishlistItemsCount = useSelector(
    (state: RootState) => state.wishlist?.items?.length || 0
  );

  const unreadNotificationCount = useSelector(
    (state: RootState) => state.notification.unreadCount || 0
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      dispatch(fetchUnreadCount());

      const token = localStorage.getItem("userToken");
      if (token && user._id) {
        notificationSocketService.initializeNotificationSocket(user._id, token);
      }
    }
    return () => {
      if (isAuthenticated) {
        notificationSocketService.disconnectNotificationSocket();
      }
    };
  }, [dispatch, isAuthenticated, user._id]);

  const handleLogout = () => {
    notificationSocketService.disconnectNotificationSocket();
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/login", { replace: true });
    setMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
      setMobileMenuOpen(false);
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
    setMobileMenuOpen(false);
  };

  const handleWishlistClick = () => {
    navigate("/dashboard/wishlist");
    setMobileMenuOpen(false);
  };

  const handleNotificationClick = () => {
    navigate("/dashboard/notifications");
    setMobileMenuOpen(false);
  };
  const handleCoursesClick = () => {
    navigate("/courses");
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const mobileMenuItems = [
    { text: "Courses", icon: <Notifications />, onClick: handleCoursesClick },
    ...(isAuthenticated
      ? [
          {
            text: "Dashboard",
            icon: <Notifications />,
            onClick: handleDashboard,
          },
          {
            text: "Wishlist",
            icon: (
              <Badge badgeContent={wishlistItemsCount} color="secondary">
                <Favorite />
              </Badge>
            ),
            onClick: handleWishlistClick,
          },
          {
            text: "Notifications",
            icon: (
              <Badge badgeContent={unreadNotificationCount} color="error">
                <Notifications />
              </Badge>
            ),
            onClick: handleNotificationClick,
          },
          {
            text: "Cart",
            icon: (
              <Badge badgeContent={cartItemCount} color="secondary">
                <ShoppingBag />
              </Badge>
            ),
            onClick: handleCartClick,
          },
          { text: "Logout", icon: <Close />, onClick: handleLogout },
        ]
      : [{ text: "Login", icon: <Notifications />, onClick: handleLogin }]),
  ];

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: "white", boxShadow: 1, padding: { xs: 1, sm: 2 } }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          component="img"
          src={logo}
          alt="Parent Teen Life Academy Logo"
          sx={{ height: { xs: 40, sm: 60 }, cursor: "pointer" }}
          onClick={() => navigate("/")}
        />

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button color="primary" onClick={handleCoursesClick}>
              Courses
            </Button>

            {isAuthenticated ? (
              <>
                <Button color="primary" onClick={handleDashboard}>
                  Dashboard
                </Button>
                <IconButton color="primary" onClick={handleWishlistClick}>
                  <Badge badgeContent={wishlistItemsCount} color="secondary">
                    <Favorite />
                  </Badge>
                </IconButton>
                <IconButton color="primary" onClick={handleNotificationClick}>
                  <Badge badgeContent={unreadNotificationCount} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
                <IconButton color="primary" onClick={handleCartClick}>
                  <Badge badgeContent={cartItemCount} color="secondary">
                    <ShoppingBag />
                  </Badge>
                </IconButton>
                <Button color="primary" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button color="primary" onClick={handleLogin}>
                Login
              </Button>
            )}
          </Box>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <IconButton color="primary" onClick={toggleMobileMenu}>
            <Menu />
          </IconButton>
        )}

        {/* Mobile Menu Drawer */}
        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={toggleMobileMenu}
          sx={{
            "& .MuiDrawer-paper": { width: "70%", maxWidth: 300 },
          }}
        >
          <Box sx={{ width: "100%", p: 2 }}>
            <Box
              component="img"
              src={logo}
              alt="Parent Teen Life Academy Logo"
              sx={{ height: 40, mb: 2 }}
            />
            <List>
              {mobileMenuItems.map((item, index) => (
                <ListItem
                  key={index}
                  onClick={item.onClick}
                  sx={{ cursor: "pointer" }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

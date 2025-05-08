import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { RootState, AppDispatch } from "../Store/store";
import { adminLogout } from "../Features/adminSlice";
import logo from "/logo.png";

const AdminNavbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.admin);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin", { replace: true });
  };

  const handleLogin = () => {
    navigate("/admin/dashboard");
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "white", boxShadow: 1, p: 2 }}>
      <Toolbar>
        <Box
          component="img"
          src={logo}
          alt="Parent Teen Life Academy Logo"
          sx={{ height: 60, cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated ? (
          <>
            <Button color="primary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="primary" onClick={handleLogin}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;

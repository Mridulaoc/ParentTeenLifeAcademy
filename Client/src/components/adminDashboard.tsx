import { Outlet } from "react-router-dom";
import AdminSidebar from "./adminSidebar";
import { Avatar, Typography } from "@mui/material";

export function AdminDashboardLayout() {
  return (
    <div className="w-full px-0 mx-0">
      <div className="w-full">
        <div className="flex gap-3">
          <Avatar />
          <Typography variant="h6">Hi Admin,</Typography>
        </div>

        <hr className="w-screen absolute left-0 border-gray-300 my-2" />
      </div>

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 mt-10 ml-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

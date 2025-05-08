import { Badge, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { AppDispatch, RootState } from "../Store/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { clearChatState, fetchAdminChats } from "../Features/chatSlice";

import {
  initializeChatSocket,
  isSocketConnected,
} from "../Services/chatSocketService";
import {
  Bell,
  BookOpen,
  Calendar,
  FileQuestion,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  StarHalf,
  Ticket,
  User,
  BarChart2,
} from "lucide-react";

const AdminSidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [prevPath, setPrevPath] = useState("");
  const { chats, currentChat } = useSelector((state: RootState) => state.chat);
  const { token, admin } = useSelector((state: RootState) => state.admin);

  const isChatPage = location.pathname === "/admin/dashboard/chat";

  useEffect(() => {
    if (admin && token) {
      if (!isSocketConnected()) {
        initializeChatSocket(admin, token, true);
      }
      dispatch(fetchAdminChats());
    }
  }, [dispatch, admin, token]);

  useEffect(() => {
    if (prevPath === "/admin/dashboard/chat" && !isChatPage) {
      dispatch(clearChatState());
    }

    setPrevPath(location.pathname);
  }, [location.pathname, dispatch, prevPath]);

  const totalUnreadCount = chats.reduce((total, chat) => {
    if (currentChat && chat._id === currentChat._id && isChatPage) {
      return total;
    }
    return total + (chat.unreadCount || 0);
  }, 0);

  useEffect(() => {
    if (!isChatPage && admin && token) {
      const interval = setInterval(() => {
        dispatch(fetchAdminChats());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isChatPage, dispatch, admin, token]);

  const menuItems = [
    {
      text: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/admin/dashboard",
    },

    {
      text: "Courses",
      icon: <BookOpen size={20} />,
      href: "/admin/dashboard/courses",
    },
    {
      text: "Course Bundles",
      icon: <PackageSearch size={20} />,
      href: "/admin/dashboard/bundles",
    },
    { text: "Users", icon: <User size={20} />, href: "/admin/dashboard/users" },
    {
      text: "Reviews",
      icon: <StarHalf size={20} />,
      href: "/admin/dashboard/reviews",
    },
    {
      text: "Q&A",
      icon: <FileQuestion size={20} />,
      href: "/admin/dashboard/chat",
      showBadge: true,
      badgeContent: totalUnreadCount,
    },
    {
      text: "Enrollments",
      icon: <GraduationCap size={20} />,
      href: "/admin/dashboard/enrollment",
    },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      href: "/admin/dashboard/notifications",
    },
    {
      text: "Categories",
      icon: <FolderTree size={20} />,
      href: "/admin/dashboard/categories",
    },
    {
      text: "Coupons",
      icon: <Ticket size={20} />,
      href: "/admin/dashboard/coupons",
    },
    {
      text: "Orders",
      icon: <ShoppingCart size={20} />,
      href: "/admin/dashboard/orders",
    },
    {
      text: "Schedule Classes",
      icon: <Calendar size={20} />,
      href: "/admin/dashboard/schedule",
    },
    {
      text: "Sales Report",
      icon: <BarChart2 size={20} />,
      href: "/admin/dashboard/sales-report",
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r">
      <div className="p-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors
          `}
          >
            {item.icon}
            <Typography>{item.text}</Typography>
            {item.showBadge && item.badgeContent > 0 && (
              <Badge
                badgeContent={item.badgeContent}
                color="secondary"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#3BB7F4",
                    color: "white",
                    fontWeight: "bold",
                  },
                }}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;

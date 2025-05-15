import { Badge, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  LayoutDashboard,
  User,
  Heart,
  MessageSquare,
  Settings,
  History,
  FileQuestion,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { IUser } from "../Types/userTypes";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { isSocketConnected } from "../Services/webrtcSocketService";
import { initializeChatSocket } from "../Services/chatSocketService";
import { clearChatState, fetchStudentChats } from "../Features/chatSlice";
interface SidebarProps {
  user?: IUser;
  onItemClick?: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ user, onItemClick }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [prevPath, setPrevPath] = useState("");
  const { chats, currentChat } = useSelector((state: RootState) => state.chat);
  const { token } = useSelector((state: RootState) => state.user);

  const isChatPage = location.pathname === "/dashboard/chat";

  const isGoogleUser =
    user?.signInMethod === "google" || user?.googleId !== null;

  const hasEnrolledCourses =
    user && user.enrolledCourses && user.enrolledCourses.length > 0;

  useEffect(() => {
    if (user?._id && token) {
      if (!isSocketConnected()) {
        initializeChatSocket(user._id.toString(), token, false);
      }
      dispatch(fetchStudentChats());
    }
  }, [dispatch, user?._id, token]);

  useEffect(() => {
    if (prevPath === "/dashboard/chat" && !isChatPage) {
      dispatch(clearChatState());
    }
    setPrevPath(location.pathname);
  }, [location.pathname, dispatch, isChatPage, prevPath]);

  useEffect(() => {
    if (!isChatPage && user?._id && token) {
      const intervalId = setInterval(() => {
        dispatch(fetchStudentChats());
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [isChatPage, dispatch, user?._id, token]);

  const totalUnreadCount = chats.reduce((total, chat) => {
    if (currentChat && chat._id === currentChat._id && isChatPage) {
      return total;
    }
    return total + (chat.unreadCount || 0);
  }, 0);

  const menuItems = [
    {
      text: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard",
      visible: true,
    },
    {
      text: "Profile",
      icon: <User size={20} />,
      href: "/dashboard/profile",
      visible: true,
    },

    {
      text: "Wishlist",
      icon: <Heart size={20} />,
      href: "/dashboard/wishlist",
      visible: true,
    },

    {
      text: "Q&A",
      icon: <FileQuestion size={20} />,
      href: "/dashboard/chat",
      visible: hasEnrolledCourses,
      showBadge: true,
      badgeContent: totalUnreadCount,
    },
    {
      text: "Notifications",
      icon: <MessageSquare size={20} />,
      href: "/dashboard/notifications",
      visible: true,
    },
    {
      text: "Settings",
      icon: <Settings size={20} />,
      href: "/dashboard/settings",
      visible: true,
    },
    {
      text: "Change Password",
      icon: <Settings size={20} />,
      href: "/dashboard/change-password",
      visible: !isGoogleUser,
    },
    {
      text: "Order History",
      icon: <History size={20} />,
      href: "/dashboard/order-history",
      visible: true,
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => item.visible);

  const handleItemClick = () => {
    if (isMobile && onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r">
      <div className="p-4">
        {visibleMenuItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={index}
              to={item.href}
              onClick={handleItemClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors
        ${
          isActive
            ? "bg-blue-100 text-blue-600 font-semibold"
            : "text-gray-700 hover:bg-gray-100"
        }
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
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;

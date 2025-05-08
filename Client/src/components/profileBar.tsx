import { useSelector } from "react-redux";
import { User } from "lucide-react";
import { RootState } from "../Store/store";
import { Avatar, Typography } from "@mui/material";

const ProfileBar = () => {
  const { user } = useSelector((state: RootState) => state.user);

  if (!user) return null;

  return (
    <div className="w-full px-0 mx-0">
      <div className="flex items-center py-1 rounded-md">
        {user.profileImg ? (
          <Avatar
            src={user.profileImg}
            alt={`${user.firstName} ${user.lastName}`}
            sx={{ width: 50, height: 50, mb: 0, mx: 3 }}
          />
        ) : (
          <User className="w-10 h-10 text-gray-500 mr-3" />
        )}
        <div>
          <Typography sx={{ textTransform: "capitalize" }}>
            {user.username || "User"}
          </Typography>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      </div>
      <hr className="w-screen absolute left-0 border-gray-300" />
    </div>
  );
};

export default ProfileBar;

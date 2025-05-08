import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { RootState } from "../Store/store";

import moment from "moment";

export const Profile = () => {
  const { user, loading } = useSelector((state: RootState) => state.user);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardContent>
          <Typography
            variant="h6"
            className="text-center mb-6 font-bold text-gray-800"
          >
            My Profile
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.firstName && (
              <ProfileItem label="First Name" value={user.firstName} />
            )}

            {user.lastName && (
              <ProfileItem label="Last Name" value={user.lastName} />
            )}

            {user.email && <ProfileItem label="Email" value={user.email} />}

            {user.phone && <ProfileItem label="Phone" value={user.phone} />}

            {user.username && (
              <ProfileItem label="Username" value={user.username} />
            )}

            {user.createdAt && (
              <ProfileItem
                label="Registration Date"
                value={moment(user.createdAt).format("LL")}
              />
            )}

            {user.occupation && (
              <ProfileItem label="Occupation" value={user.occupation} />
            )}
          </div>

          {user.bio && (
            <div className="mt-6">
              <Divider className="my-4" />
              <Typography variant="h6" className="text-gray-700 mb-2">
                Biography
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                {user.bio}
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
const ProfileItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
    <div>
      <Typography variant="subtitle2" className="text-gray-500">
        {label}
      </Typography>
      <Typography variant="body1" className="font-semibold">
        {value}
      </Typography>
    </div>
  </div>
);

import { Box, Button, CircularProgress } from "@mui/material";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { fetchClass } from "../Features/classSlice";
import { ILiveClassDetails } from "../Types/classTypes";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  initializeWebRTCSocket,
  joinRoom,
  sendReadySignal,
  setupLocalStream,
} from "../Services/webrtcSocketService";
import { setError } from "../Features/webRTCSlice";

const Join = () => {
  const [classSchedule, setClassSchedule] = useState<ILiveClassDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  // const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, token } = useSelector((state: RootState) => state.user);
  const { admin: adminId, token: adminToken } = useSelector(
    (state: RootState) => state.admin
  );

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await dispatch(fetchClass()).unwrap();
        console.log("Response:", response);
        setClassSchedule(response);
      } catch (error) {
        console.error("Failed to fetch class data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [dispatch, setClassSchedule]);

  useEffect(() => {
    if (!classSchedule || !classSchedule.nextOccurrence) return;
    const checkTime = () => {
      const now = new Date();
      const classStartTime = new Date(classSchedule.nextOccurrence!);
      const classEndTime = new Date(
        classStartTime.getTime() + classSchedule.duration * 60000
      );

      const fiveMinutesBefore = new Date(classStartTime.getTime() - 5 * 60000);

      if (now >= fiveMinutesBefore && now <= classEndTime) {
        // setIsButtonEnabled(true);
      } else {
        // setIsButtonEnabled(false);
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [classSchedule]);

  const handleJoinLiveClass = async () => {
    const isAdminRoute = window.location.pathname.startsWith("/admin");

    let userId, userToken;

    if (isAdminRoute && adminId && adminToken && classSchedule) {
      userId = adminId;
      userToken = adminToken;
      initializeWebRTCSocket(adminId, adminToken, true);
    } else if (!isAdminRoute && user?._id && token && classSchedule) {
      userId = user._id;
      userToken = token;
      initializeWebRTCSocket(user._id, userToken, false);
    }

    try {
      if (!userId) {
        console.error("User ID is undefined");
        dispatch(setError("User ID is missing. Please try logging in again."));
        return;
      }

      const roomId = classSchedule?.roomId;

      if (!roomId) {
        dispatch(setError("Class room ID is missing."));
        return;
      }
      await setupLocalStream();
      if (joinRoom(roomId, userId.toString())) {
        navigate(`/room/${roomId}`);
        setTimeout(() => {
          sendReadySignal(roomId);
        }, 1000);
      }
    } catch (error) {
      console.error("Error joining class:", error);
      dispatch(setError("Failed to join class. Please try again."));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<VideoCallIcon />}
      onClick={handleJoinLiveClass}
      // disabled={isButtonEnabled && process.env.NODE_ENV === "production"}
      sx={{
        mt: 2,
        mb: 2,
        fontWeight: "bold",
      }}
    >
      Join Live Class
    </Button>
  );
};

export default Join;

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import {
  CallEnd,
  Mic,
  MicOff,
  ScreenShare,
  StopScreenShare,
  Videocam,
  VideocamOff,
} from "@mui/icons-material";
import { setError, stopScreenSharing } from "../Features/webRTCSlice";
import webrtcSocketService from "../Services/webrtcSocketService";

const ClassRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    localStream,
    remoteStreams,
    currentRoom,
    participants,
    className,
    isLoading,
    error,
    isScreenSharing,
  } = useSelector((state: RootState) => state.webRTC);
  const { user, token } = useSelector((state: RootState) => state.user);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [localScreenSharing, setLocalScreenSharing] = useState(false);

  const totalStreams = 1 + Object.keys(remoteStreams).length;
  const getGridSize = () => {
    if (totalStreams === 1) {
      return 12;
    } else if (totalStreams === 2) {
      return 6;
    } else if (totalStreams <= 4) {
      return 6;
    } else {
      return 4;
    }
  };
  const getContainerHeight = () => {
    if (totalStreams === 1) {
      return "100%";
    } else if (totalStreams === 2) {
      return "100%";
    } else if (totalStreams <= 4) {
      return "calc(70% - 16px)";
    } else {
      return "calc(33.333% - 16px)";
    }
  };
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (roomId && !currentRoom && !isLoading) {
      if (token && user?._id) {
        try {
          if (!localStream) {
            webrtcSocketService.setupLocalStream().catch(() => {
              dispatch(setError("Failed to access camera/microphone"));
            });
          }

          webrtcSocketService.joinRoom(roomId, user._id.toString());

          setTimeout(() => {
            webrtcSocketService.sendReadySignal(roomId);
          }, 1000);
        } catch (err) {
          console.error("Error joining room:", err);
          dispatch(setError("Failed to join room"));
        }
      }
    }
  }, [roomId, currentRoom]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      try {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current
          .play()
          .then(() => console.log("Local video playback started"))
          .catch((err) => console.error("Local video playback error:", err));

        setTimeout(() => {
          if (localVideoRef.current) {
            console.log(
              "Local video readyState:",
              localVideoRef.current.readyState
            );
            console.log(
              "Local video videoWidth x videoHeight:",
              localVideoRef.current.videoWidth,
              "x",
              localVideoRef.current.videoHeight
            );
          }
        }, 1000);
      } catch (err) {
        console.error("Error setting local video source:", err);
      }
    } else {
      console.log(
        "Cannot set local video:",
        !!localStream,
        !!localVideoRef.current
      );
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      if (currentRoom) {
        webrtcSocketService.leaveRoom(currentRoom);
      }
    };
  }, [currentRoom]);

  const handleToggleAudio = () => {
    webrtcSocketService.toggleAudio();
    setAudioEnabled(!audioEnabled);
  };

  const handleToggleVideo = () => {
    webrtcSocketService.toggleVideo();
    setVideoEnabled(!videoEnabled);
  };
  const handleShareScreen = async () => {
    try {
      if (localScreenSharing) {
        dispatch(stopScreenSharing());
        setLocalScreenSharing(false);
      } else {
        const screenStream = await webrtcSocketService.startScreenSharing();
        if (screenStream && screenStream.getVideoTracks().length > 0) {
          screenStream.getVideoTracks()[0].onended = () => {
            webrtcSocketService.stopScreenSharing();
            setLocalScreenSharing(false);
          };
        }
        setLocalScreenSharing(true);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
      setLocalScreenSharing(false);
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      webrtcSocketService.leaveRoom(currentRoom);
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error" variant="h5">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: "calc(100vh - 64px)" }}>
      <Typography variant="h4" gutterBottom>
        {className || "Live Class"}
      </Typography>

      <Typography variant="body2" gutterBottom>
        Participants: {participants}
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2, height: "calc(100% - 150px)" }}>
        <Grid item xs={12} md={getGridSize()}>
          <Paper
            elevation={3}
            sx={{
              position: "relative",
              height: totalStreams <= 2 ? "100%" : getContainerHeight(),
              overflow: "hidden",
              borderRadius: 2,
              backgroundColor: "black",
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                padding: "4px 8px",
                borderRadius: 1,
              }}
            >
              {isScreenSharing ? "Your Screen" : "You"}
            </Box>
          </Paper>
        </Grid>

        {Object.entries(remoteStreams).map(([userId, streamInfo]) => (
          <Grid item xs={12} md={getGridSize()} key={userId}>
            <Paper
              elevation={3}
              sx={{
                position: "relative",
                height: totalStreams <= 2 ? "100%" : getContainerHeight(),
                overflow: "hidden",
                borderRadius: 2,
                backgroundColor: "black",
              }}
            >
              <video
                autoPlay
                playsInline
                ref={(element) => {
                  if (element) {
                    element.srcObject = streamInfo.stream;
                  }
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  padding: "4px 8px",
                  borderRadius: 1,
                }}
              >
                {streamInfo.username || "Unknown User"}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          p: 2,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Tooltip title={audioEnabled ? "Mute microphone" : "Unmute microphone"}>
          <IconButton
            color={audioEnabled ? "primary" : "error"}
            onClick={handleToggleAudio}
            sx={{ mx: 1 }}
          >
            {audioEnabled ? <Mic /> : <MicOff />}
          </IconButton>
        </Tooltip>
        <Tooltip title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
          <IconButton
            color={videoEnabled ? "primary" : "error"}
            onClick={handleToggleVideo}
            sx={{ mx: 1 }}
          >
            {videoEnabled ? <Videocam /> : <VideocamOff />}
          </IconButton>
        </Tooltip>
        <Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
          <IconButton
            color={isScreenSharing ? "secondary" : "primary"}
            onClick={handleShareScreen}
            sx={{ mx: 1 }}
          >
            {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          color="error"
          startIcon={<CallEnd />}
          onClick={handleLeaveRoom}
          sx={{ mx: 1 }}
        >
          Leave
        </Button>
      </Box>
    </Box>
  );
};

export default ClassRoom;

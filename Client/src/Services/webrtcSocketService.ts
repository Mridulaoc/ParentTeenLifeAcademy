import { io, Socket } from "socket.io-client";
import {
  setRoomInfo,
  addRemoteStream,
  removeRemoteStream,
  addPeerConnection,
  setError,
  updateParticipants,
  setConnectionState,
} from "../Features/webRTCSlice";
import store from "../Store/store";

let webRTCSocket: Socket | null = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const SOCKET_TYPE = "webrtc";

const peerConnections: Record<string, RTCPeerConnection> = {};
let localStream: MediaStream | null = null;

const remoteUsers: Record<
  string,
  {
    username: string;
    profileImg?: string;
  }
> = {};

const peerConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export const initializeWebRTCSocket = (
  userId: string,
  token: string,
  isAdmin = false
) => {
  if (!userId || !token) {
    console.error(
      "WebRTC socket initialization failed: Missing userId or token"
    );
    return null;
  }

  if (webRTCSocket && webRTCSocket.connected) {
    return webRTCSocket;
  }

  if (webRTCSocket) {
    webRTCSocket.removeAllListeners();
    webRTCSocket.disconnect();
    webRTCSocket = null;
  }

  connectionAttempts = 0;

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  webRTCSocket = io(`${API_BASE_URL}/webrtc`, {
    path: "/socket.io/",
    transports: ["websocket"],
    auth: {
      token,
      userId,
      socketType: SOCKET_TYPE,
      userType: isAdmin ? "admin" : "student",
    },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  });

  setupSocketListeners(webRTCSocket, userId);

  webRTCSocket.on("connect", () => {
    store.dispatch(setConnectionState(true));
    connectionAttempts = 0;
  });

  webRTCSocket.on("connect_error", (error) => {
    console.error("WebRTC connection error:", error);
    store.dispatch(setConnectionState(false));
    connectionAttempts++;
    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      webRTCSocket?.disconnect();
    }
  });

  return webRTCSocket;
};

const setupSocketListeners = (socket: Socket, userId: string) => {
  socket.removeAllListeners();

  socket.on("room-joined", (data) => {
    store.dispatch(setRoomInfo(data));
  });

  socket.on("user-joined", (data) => {
    remoteUsers[data.userId] = {
      username: data.username || "Unknown User",
      profileImg: data.profileImg,
    };
    store.dispatch(updateParticipants({ participants: data.participants }));
  });

  socket.on("user-disconnected", (data) => {
    cleanupPeerConnection(data.userId);
    store.dispatch(removeRemoteStream(data.userId));
    delete remoteUsers[data.userId];
  });

  socket.on("participants-updated", (data) => {
    store.dispatch(updateParticipants({ participants: data.participants }));
  });

  socket.on("user-ready", (data) => {
    if (data.username) {
      remoteUsers[data.userId] = {
        ...(remoteUsers[data.userId] || {}),
        username: data.username,
      };
    }
    if (localStream) {
      const pc = createPeerConnection(data.userId);
      createAndSendOffer(data.userId, pc);
    }
  });

  socket.on("webrtc-offer", async (data) => {
    if (data.senderName) {
      remoteUsers[data.sender] = {
        ...(remoteUsers[data.sender] || {}),
        username: data.senderName,
      };
    }
    try {
      const pc = getPeerConnection(data.sender);

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        roomId: store.getState().webRTC.currentRoom,
        answer: pc.localDescription,
        receiver: data.sender,
      });
    } catch (err) {
      console.error("Error handling WebRTC offer:", err);
      store.dispatch(setError("Failed to process WebRTC offer"));
    }
  });

  socket.on("webrtc-answer", async (data) => {
    try {
      const pc = peerConnections[data.sender];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    } catch (err) {
      console.error("Error handling WebRTC answer:", err);
      store.dispatch(setError("Failed to process WebRTC answer"));
    }
  });

  socket.on("webrtc-ice-candidate", async (data) => {
    try {
      const pc = peerConnections[data.sender];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    } catch (err) {
      console.error("Error handling ICE candidate:", err);
    }
  });

  socket.on("disconnect", (reason) => {
    store.dispatch(setConnectionState(false));

    if (reason === "io server disconnect") {
      setTimeout(() => socket.connect(), 1000);
    }
  });

  socket.on("heartbeat", () => {
    socket.emit("heartbeat-response");
  });
};

export const joinRoom = (roomId: string, userId: string) => {
  if (!webRTCSocket || !webRTCSocket.connected) {
    console.error("Cannot join room: WebRTC socket is not connected");
    return false;
  }

  webRTCSocket.emit("join-room", { roomId, userId });
  return true;
};

export const leaveRoom = (roomId: string) => {
  if (!webRTCSocket || !webRTCSocket.connected) {
    console.error("Cannot leave room: WebRTC socket is not connected");
    return false;
  }

  webRTCSocket.emit("leave-room", { roomId });

  Object.keys(peerConnections).forEach(cleanupPeerConnection);
  Object.keys(remoteUsers).forEach((userId) => delete remoteUsers[userId]);

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }

  return true;
};

export const setupLocalStream = async (
  videoEnabled = true,
  audioEnabled = true
): Promise<MediaStream> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser");
      store.dispatch(
        setError("Camera/microphone access not supported in this browser")
      );
      throw new Error("getUserMedia not supported");
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    localStream = await navigator.mediaDevices.getUserMedia({
      video: videoEnabled,
      audio: audioEnabled,
    });

    store.dispatch({
      type: "webRTC/setupLocalStream/fulfilled",
      payload: localStream,
    });

    const videoTracks = localStream.getVideoTracks();

    if (videoTracks.length > 0) {
      console.log(
        "Video track:",
        videoTracks[0].label,
        "enabled:",
        videoTracks[0].enabled
      );
    } else if (videoEnabled) {
      console.warn("Requested video but no video tracks were obtained");
    }
    return localStream;
  } catch (err) {
    console.error("Error accessing media devices:", err);
    store.dispatch(setError("Failed to access camera/microphone"));
    throw new Error("Failed to access camera/microphone");
  }
};

export const sendReadySignal = (roomId: string) => {
  if (!webRTCSocket || !webRTCSocket.connected) {
    console.error("Cannot send ready signal: WebRTC socket is not connected");
    return false;
  }
  const user = store.getState().user.user;

  webRTCSocket.emit("user-ready", {
    roomId,
    username: user?.username || user?.firstName || "User",
  });
  return true;
};

const getPeerConnection = (remoteUserId: string): RTCPeerConnection => {
  if (peerConnections[remoteUserId]) {
    return peerConnections[remoteUserId];
  }

  return createPeerConnection(remoteUserId);
};

const createPeerConnection = (remoteUserId: string): RTCPeerConnection => {
  if (!localStream) {
    throw new Error("Local stream not initialized");
  }

  const pc = new RTCPeerConnection(peerConfig);

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream!);
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      webRTCSocket?.emit("webrtc-ice-candidate", {
        roomId: store.getState().webRTC.currentRoom,
        candidate: event.candidate,
        receiver: remoteUserId,
      });
    }
  };

  pc.ontrack = (event) => {
    if (event.streams && event.streams.length > 0) {
      const stream = event.streams[0];
      store.dispatch(
        addRemoteStream({
          userId: remoteUserId,
          stream,
          username: remoteUsers[remoteUserId]?.username || "Unknown User",
          profileImg: remoteUsers[remoteUserId]?.profileImg,
        })
      );
    } else {
      console.error("No streams in track event");
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed" || pc.connectionState === "closed") {
      cleanupPeerConnection(remoteUserId);
    }
  };

  pc.oniceconnectionstatechange = () => {
    console.log(
      `ICE connection state for ${remoteUserId}: ${pc.iceConnectionState}`
    );
  };

  peerConnections[remoteUserId] = pc;
  store.dispatch(
    addPeerConnection({ userId: remoteUserId, peerConnection: pc })
  );

  return pc;
};

const createAndSendOffer = async (userId: string, pc: RTCPeerConnection) => {
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const user = store.getState().user.user;

    webRTCSocket?.emit("webrtc-offer", {
      roomId: store.getState().webRTC.currentRoom,
      offer: pc.localDescription,
      receiver: userId,
      senderName: user?.username || user?.firstName || "User",
    });
  } catch (err) {
    console.error("Error creating offer:", err);
    store.dispatch(setError("Failed to create connection offer"));
  }
};

const cleanupPeerConnection = (userId: string) => {
  const pc = peerConnections[userId];
  if (pc) {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    pc.oniceconnectionstatechange = null;
    pc.close();
    delete peerConnections[userId];
  }
};

export const toggleAudio = (): boolean => {
  if (!localStream) return false;

  const audioTracks = localStream.getAudioTracks();
  if (audioTracks.length === 0) return false;

  const enabled = !audioTracks[0].enabled;
  audioTracks.forEach((track) => {
    track.enabled = enabled;
  });

  return enabled;
};

export const toggleVideo = (): boolean => {
  if (!localStream) return false;

  const videoTracks = localStream.getVideoTracks();
  if (videoTracks.length === 0) return false;

  const enabled = !videoTracks[0].enabled;
  videoTracks.forEach((track) => {
    track.enabled = enabled;
  });

  return enabled;
};

export const startScreenSharing = async (): Promise<MediaStream> => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    const videoTrack = screenStream.getVideoTracks()[0];

    Object.values(peerConnections).forEach((pc) => {
      const senders = pc.getSenders();
      const videoSender = senders.find(
        (sender) => sender.track && sender.track.kind === "video"
      );

      if (videoSender) {
        videoSender.replaceTrack(videoTrack);
      }
    });

    videoTrack.onended = () => {
      stopScreenSharing();
    };

    return screenStream;
  } catch (err) {
    console.error("Error starting screen sharing:", err);
    store.dispatch(setError("Failed to start screen sharing"));
    throw new Error("Failed to start screen sharing");
  }
};

export const stopScreenSharing = (): boolean => {
  if (!localStream) return false;

  const videoTrack = localStream.getVideoTracks()[0];
  if (!videoTrack) return false;

  Object.values(peerConnections).forEach((pc) => {
    const senders = pc.getSenders();
    const videoSender = senders.find(
      (sender) => sender.track && sender.track.kind === "video"
    );

    if (videoSender) {
      videoSender.replaceTrack(videoTrack);
    }
  });

  return true;
};

export const isSocketConnected = (): boolean => {
  return webRTCSocket !== null && webRTCSocket.connected;
};

export const disconnectWebRTCSocket = (): boolean => {
  if (!webRTCSocket) return false;

  Object.keys(peerConnections).forEach(cleanupPeerConnection);

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  webRTCSocket.removeAllListeners();
  webRTCSocket.disconnect();
  webRTCSocket = null;

  return true;
};

export default {
  initializeWebRTCSocket,
  joinRoom,
  leaveRoom,
  setupLocalStream,
  sendReadySignal,
  toggleAudio,
  toggleVideo,
  startScreenSharing,
  stopScreenSharing,
  isSocketConnected,
  disconnectWebRTCSocket,
};

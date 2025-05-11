import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { NavigateFunction } from "react-router-dom";
import { AppDispatch, RootState } from "../Store/store";
import webRTCService from "../Services/webrtcSocketService";

interface RemoteStreamInfo {
  stream: MediaStream;
  username?: string;
  profileImg?: string;
}

interface WebRTCState {
  currentRoom: string | null;
  localStream: MediaStream | null;
  remoteStreams: Record<string, RemoteStreamInfo>;
  peerConnections: Record<string, RTCPeerConnection>;
  participants: number;
  className: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  screenSharingStream: MediaStream | null;
  isConnected: boolean;
}

const initialState: WebRTCState = {
  currentRoom: null,
  localStream: null,
  remoteStreams: {},
  peerConnections: {},
  participants: 0,
  className: "",
  description: "",
  isLoading: false,
  error: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenSharing: false,
  screenSharingStream: null,
  isConnected: false,
};

export const initializeWebRTCSocket = createAsyncThunk(
  "webRTC/initializeSocket",
  async ({
    userId,
    token,
    isAdmin,
  }: {
    userId: string;
    token: string;
    isAdmin: boolean;
  }) => {
    const socket = webRTCService.initializeWebRTCSocket(userId, token, isAdmin);
    return socket ? socket.id : null;
  }
);

export const setupLocalStream = createAsyncThunk(
  "webRTC/setupLocalStream",
  async (): Promise<MediaStream> => {
    try {
      const stream = await webRTCService.setupLocalStream();
      if (!stream) {
        throw new Error("Failed to access media devices");
      }
      return stream;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to access media devices");
      }
      throw new Error("Unknown error occurred");
    }
  }
);

export const joinRoom = createAsyncThunk(
  "webRTC/joinRoom",
  async (
    { roomId, userId }: { roomId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const joined = webRTCService.joinRoom(roomId, userId);
      if (!joined) {
        return rejectWithValue("Failed to join room");
      }

      setTimeout(() => {
        webRTCService.sendReadySignal(roomId);
      }, 1000);

      return { roomId };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Failed to join room");
      }
    }
  }
);

export const leaveRoom = createAsyncThunk(
  "webRTC/leaveRoom",
  async (navigate: NavigateFunction, { getState }) => {
    const state = getState() as RootState;
    const { currentRoom } = state.webRTC;

    if (currentRoom) {
      webRTCService.leaveRoom(currentRoom);
      navigate("/");
    }

    return null;
  }
);

export const toggleAudio = createAsyncThunk("webRTC/toggleAudio", async () => {
  return webRTCService.toggleAudio();
});

export const toggleVideo = createAsyncThunk("webRTC/toggleVideo", async () => {
  return webRTCService.toggleVideo();
});

export const shareScreen = createAsyncThunk(
  "webRTC/shareScreen",
  async (): Promise<MediaStream> => {
    try {
      const stream = await webRTCService.startScreenSharing();
      if (!stream) {
        throw new Error("Failed to start screen sharing");
      }
      return stream;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to share screen");
      }
      throw new Error("Unknown error occurred while sharing screen");
    }
  }
);

export const stopScreenSharing = createAsyncThunk(
  "webRTC/stopScreenSharing",
  async () => {
    return webRTCService.stopScreenSharing();
  }
);

// Handle screen sharing ended event
export const handleScreenSharingEnded =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    if (state.webRTC.isScreenSharing) {
      dispatch(stopScreenSharing());
    }
  };

// Disconnect WebRTC socket
export const disconnectWebRTCSocket = createAsyncThunk(
  "webRTC/disconnectSocket",
  async () => {
    return webRTCService.disconnectWebRTCSocket();
  }
);

// The rest of your slice can remain mostly the same
const webRTCSlice = createSlice({
  name: "webRTC",
  initialState,
  reducers: {
    setRoomInfo: (
      state,
      action: PayloadAction<{
        roomId: string;
        className: string;
        description: string;
        participants: number;
      }>
    ) => {
      state.currentRoom = action.payload.roomId;
      state.className = action.payload.className;
      state.description = action.payload.description;
      state.participants = action.payload.participants;
    },
    addRemoteStream: (
      state,
      action: PayloadAction<{
        userId: string;
        stream: MediaStream;
        username?: string;
        profileImg?: string;
      }>
    ) => {
      state.remoteStreams[action.payload.userId] = {
        stream: action.payload.stream,
        username: action.payload.username || "Unknown User",
        profileImg: action.payload.profileImg,
      };
    },
    removeRemoteStream: (state, action: PayloadAction<string>) => {
      delete state.remoteStreams[action.payload];
      delete state.peerConnections[action.payload];
      state.participants = Math.max(0, state.participants - 1);
    },
    addPeerConnection: (
      state,
      action: PayloadAction<{
        userId: string;
        peerConnection: RTCPeerConnection;
      }>
    ) => {
      state.peerConnections[action.payload.userId] =
        action.payload.peerConnection;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateParticipants: (
      state,
      action: PayloadAction<{ participants: number }>
    ) => {
      state.participants = action.payload.participants;
    },
    setConnectionState: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeWebRTCSocket.fulfilled, (state) => {
        state.isConnected = true;
        state.error = null;
      })
      .addCase(initializeWebRTCSocket.rejected, (state, action) => {
        state.isConnected = false;
        state.error = action.error.message || "Failed to connect WebRTC socket";
      })
      .addCase(joinRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinRoom.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to join room";
      })
      .addCase(setupLocalStream.fulfilled, (state, action) => {
        state.localStream = action.payload;
      })
      .addCase(setupLocalStream.rejected, (state, action) => {
        state.error = action.error.message || "Failed to access media devices";
      })
      .addCase(leaveRoom.fulfilled, (state) => {
        state.currentRoom = null;
        state.localStream = null;
        state.remoteStreams = {};
        state.peerConnections = {};
        state.participants = 0;
        state.className = "";
        state.description = "";
      })
      .addCase(toggleAudio.fulfilled, (state, action) => {
        if (action.payload !== null) {
          state.isAudioEnabled = action.payload;
        }
      })
      .addCase(toggleVideo.fulfilled, (state, action) => {
        if (action.payload !== null) {
          state.isVideoEnabled = action.payload;
        }
      })
      .addCase(shareScreen.fulfilled, (state, action) => {
        state.screenSharingStream = action.payload;
        state.isScreenSharing = true;
      })
      .addCase(shareScreen.rejected, (state, action) => {
        state.error = action.error.message || "Failed to share screen";
        state.isScreenSharing = false;
      })
      .addCase(stopScreenSharing.fulfilled, (state) => {
        state.screenSharingStream = null;
        state.isScreenSharing = false;
      });
  },
});

export const {
  setRoomInfo,
  addRemoteStream,
  removeRemoteStream,
  addPeerConnection,
  setError,
  clearError,
  updateParticipants,
  setConnectionState,
} = webRTCSlice.actions;

export default webRTCSlice.reducer;

import { Namespace, Socket } from "socket.io";

interface UserSocket extends Socket {
  data: {
    user: {
      id: string;
      email: string;
      type: "student" | "admin";
      firstName?: string;
      lastName?: string;
      name?: string;
      profileImg?: string;
    };
    currentRoom?: string;
  };
}

interface ActiveUser {
  socketId: string;
  userType: string;
  username?: string;
  profileImg?: string;
  lastActive: Date;
}

export const webRTCHandler = (
  socket: UserSocket,
  namespace: Namespace,
  activeUsers: Map<string, ActiveUser>
) => {
  activeUsers.set(socket.data.user.id, {
    socketId: socket.id,
    userType: socket.data.user.type,
    username:
      socket.data.user.name ||
      `${socket.data.user.firstName || ""} ${
        socket.data.user.lastName || ""
      }`.trim(),
    profileImg: socket.data.user.profileImg,
    lastActive: new Date(),
  });

  socket.on("join-room", (data) => {
    const { roomId, userId } = data;

    socket.join(roomId);

    socket.data.currentRoom = roomId;
    const room = namespace.adapter.rooms.get(roomId);
    const participants = room ? room.size : 1;

    socket.to(roomId).emit("user-joined", {
      userId: socket.data.user.id,
      socketId: socket.id,
      participants,
      username:
        socket.data.user.name ||
        `${socket.data.user.firstName || ""} ${
          socket.data.user.lastName || ""
        }`.trim(),
      profileImg: socket.data.user.profileImg,
      userType: socket.data.user.type,
    });

    socket.emit("room-joined", {
      roomId,
      className: "Live Session",
      description: "WebRTC video call",
      participants,
    });
  });

  socket.on("user-ready", (data) => {
    const { roomId, username } = data;

    socket.to(roomId).emit("user-ready", {
      userId: socket.data.user.id,
      username: socket.data.user.name || username,
    });
  });

  socket.on("webrtc-offer", (data) => {
    const { roomId, offer, receiver, senderName } = data;

    const receiverSocket = Array.from(namespace.sockets.values()).find((s) => {
      const userSocket = s as UserSocket;
      return userSocket.data.user?.id === receiver;
    }) as UserSocket | undefined;

    if (receiverSocket) {
      receiverSocket.emit("webrtc-offer", {
        sender: socket.data.user.id,
        senderName: socket.data.user.name || senderName,
        offer,
      });
    } else {
      socket.to(roomId).emit("webrtc-offer", {
        sender: socket.data.user.id,
        senderName: socket.data.user.name,
        offer,
      });
    }
  });

  socket.on("webrtc-answer", (data) => {
    const { roomId, answer, receiver } = data;

    const receiverSocket = Array.from(namespace.sockets.values()).find((s) => {
      const userSocket = s as UserSocket;
      return userSocket.data.user?.id === receiver;
    }) as UserSocket | undefined;

    if (receiverSocket) {
      receiverSocket.emit("webrtc-answer", {
        sender: socket.data.user.id,
        answer,
      });
    } else {
      socket.to(roomId).emit("webrtc-answer", {
        sender: socket.data.user.id,
        answer,
      });
    }
  });

  socket.on("webrtc-ice-candidate", (data) => {
    const { roomId, candidate, receiver } = data;

    const receiverSocket = Array.from(namespace.sockets.values()).find((s) => {
      const userSocket = s as UserSocket;
      return userSocket.data.user?.id === receiver;
    }) as UserSocket | undefined;

    if (receiverSocket) {
      receiverSocket.emit("webrtc-ice-candidate", {
        sender: socket.data.user.id,
        candidate,
      });
    } else {
      socket.to(roomId).emit("webrtc-ice-candidate", {
        sender: socket.data.user.id,
        candidate,
      });
    }
  });

  socket.on("leave-room", (data) => {
    const { roomId } = data;

    socket.leave(roomId);
    socket.data.currentRoom = undefined;

    socket.to(roomId).emit("user-disconnected", {
      userId: socket.data.user.id,
    });

    const room = namespace.adapter.rooms.get(roomId);
    const participants = room ? room.size : 0;

    socket.to(roomId).emit("participants-updated", {
      participants,
    });
  });

  socket.on("disconnect", (reason) => {
    if (socket.data.currentRoom) {
      socket.to(socket.data.currentRoom).emit("user-disconnected", {
        userId: socket.data.user?.id,
      });

      const room = namespace.adapter.rooms.get(socket.data.currentRoom);
      const participants = room ? room.size : 0;

      socket.to(socket.data.currentRoom).emit("participants-updated", {
        participants,
      });
    }

    activeUsers.delete(socket.data.user?.id);
  });
};

import { Namespace, Server, Socket } from "socket.io";
import { ClassRepository } from "../../../domain/repositories/classRepository";
import { WebRTCHandler } from "../webRTCService";

const userSocketMap = new Map();
const socketUserMap = new Map();

const classRepository = new ClassRepository();
export const RoomHandler = (socket: Socket, io: Server | Namespace) => {
  const joinRoom = async (data: { roomId: string; userId: string }) => {
    try {
      const { roomId, userId } = data;

      const classData = await classRepository.findByRoomId(roomId);
      if (!classData) {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      socket.data.userId = userId;

      userSocketMap.set(userId, socket.id);
      socketUserMap.set(socket.id, userId);

      socket.join(roomId);

      const io = socket.nsp.server;
      const roomMembers = io.of("/").adapter.rooms.get(roomId)?.size || 0;

      socket.emit("room-joined", {
        roomId,
        className: classData.title,
        description: classData.description,
        participants: roomMembers,
      });

      socket.to(roomId).emit("user-joined", {
        userId: userId,
        socketId: socket.id,
        timestamp: new Date(),
        participants: roomMembers,
      });
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("room-error", { message: "Failed to join room" });
    }
  };

  const handleUserReady = (data: { roomId: string }) => {
    const { roomId } = data;
    const userId = socket.data.userId;

    socket.to(roomId).emit("user-ready", {
      userId: userId,
      socketId: socket.id,
    });
  };

  const leaveRoom = (data: { roomId: string }) => {
    const { roomId } = data;
    const userId = socket.data.userId;

    socket.leave(roomId);

    socket.to(roomId).emit("user-disconnected", {
      userId: userId,
    });
  };

  const handleUserDisconnected = () => {
    const userId = socketUserMap.get(socket.id);
    if (userId) {
      userSocketMap.delete(userId);
      socketUserMap.delete(socket.id);
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit("user-disconnected", {
            userId: userId,
          });
        }
      });
    }
  };

  socket.on("join-room", joinRoom);
  socket.on("user-ready", handleUserReady);
  socket.on("leave-room", leaveRoom);
  socket.on("user-disconnected", handleUserDisconnected);
  WebRTCHandler(socket);
};

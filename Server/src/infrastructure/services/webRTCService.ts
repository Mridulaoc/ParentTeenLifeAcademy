import { Socket } from "socket.io";

export const WebRTCHandler = (socket: Socket) => {
  const handleOffer = (data: {
    roomId: string;
    offer: RTCSessionDescriptionInit;
    receiver: string;
  }) => {
    const io = socket.nsp.server;
    const sockets = io.of("/").sockets;

    for (const [socketId, socketObj] of sockets.entries()) {
      if (socketObj.data.userId === data.receiver) {
        socket.to(socketId).emit("webrtc-offer", {
          offer: data.offer,
          sender: socket.data.userId,
          senderSocketId: socket.id,
        });
        break;
      }
    }
  };

  const handleAnswer = (data: {
    roomId: string;
    answer: RTCSessionDescriptionInit;
    receiver: string;
  }) => {
    const io = socket.nsp.server;
    const sockets = io.of("/").sockets;

    for (const [socketId, socketObj] of sockets) {
      if (socketObj.data?.userId === data.receiver) {
        socket.to(socketId).emit("webrtc-answer", {
          answer: data.answer,
          sender: socket.data.userId,
          senderSocketId: socket.id,
        });
        break;
      }
    }
  };

  const handleIceCandidate = (data: {
    roomId: string;
    candidate: RTCIceCandidate;
    receiver?: string;
  }) => {
    if (data.receiver) {
      const io = socket.nsp.server;
      const sockets = io.of("/").sockets;
      for (const [socketId, socketObj] of sockets) {
        if (socketObj.data?.userId === data.receiver) {
          socket.to(socketId).emit("webrtc-ice-candidate", {
            candidate: data.candidate,
            sender: socket.data.userId,
            senderSocketId: socket.id,
          });
          break;
        }
      }
    } else {
      socket.to(data.roomId).emit("webrtc-ice-candidate", {
        candidate: data.candidate,
        sender: socket.data.userId,
        senderSocketId: socket.id,
      });
    }
  };

  socket.on("webrtc-offer", handleOffer);
  socket.on("webrtc-answer", handleAnswer);
  socket.on("webrtc-ice-candidate", handleIceCandidate);
};

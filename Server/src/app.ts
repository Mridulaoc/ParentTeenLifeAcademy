import express, { Express } from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import { connectDatabase } from "./infrastructure/database/connection";
import dotenv from "dotenv";
import userRouter from "./interfaces/https/userRoute";
import adminRouter from "../src/interfaces/https/adminRoute";
dotenv.config();
import passport from "passport";
import path from "path";
import morgan from "morgan";
import { Server, Socket } from "socket.io";
import http from "http";
import { RoomHandler } from "./infrastructure/services/socketService/roomService";
import { chatHandler } from "./infrastructure/services/socketService/chatHandler";
import jwt from "jsonwebtoken";
import { startExpirationCron } from "./infrastructure/cron/expirationCron";
import {
  JwtPayloadExtended,
  verifyToken,
} from "./infrastructure/services/jwtService";
import { socketAuthMiddleware } from "./app/middlewares/socketMiddleware";
import { SocketAddress } from "net";
import { notificationHandler } from "./infrastructure/services/socketService/notificationHandler";
import { webRTCHandler } from "./infrastructure/services/socketService/webrtcHandler";
import { startBundleExpiryNotificationCron } from "./infrastructure/cron/bundleExpiryNotificationCron";

const app: Express = express();

app.use(passport.initialize());
const corsOptions: CorsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.removeHeader("Cross-Origin-Opener-Policy");
  res.removeHeader("Cross-Origin-Embedder-Policy");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

const uploadDir = path.join(__dirname, "../uploads");

app.use("/uploads", express.static(uploadDir));

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

app.all("*", (req, res, next) => {
  if (req.path.startsWith("/socket.io")) {
    return next();
  }

  next();
});
const server = http.createServer(app);
const SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";
const activeUsers = new Map();
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io/",
  serveClient: false,
});

// Define Namespaces

const chatNamespace = io.of("/chat");
const notificationNamespace = io.of("/notification");
const webRTCNamespace = io.of("/webrtc");

chatNamespace.use(socketAuthMiddleware);
notificationNamespace.use(socketAuthMiddleware);
webRTCNamespace.use(socketAuthMiddleware);

chatNamespace.on("connection", (socket) => {
  const user = socket.data.user;

  activeUsers.set(user.id, {
    socketId: socket.id,
    userType: user.type,
    userName:
      user.type === "admin" ? user.name : `${user.firstName} ${user.lastName}`,
    profileImg: user.profileImg,
    lastActive: new Date(),
  });

  const heartbeatInterval = setInterval(() => {
    socket.emit("heartbeat");
  }, 30000);

  socket.on("heartbeat-response", () => {
    if (activeUsers.has(user.id)) {
      activeUsers.get(user.id).lastActive = new Date();
    }
  });
  chatHandler(socket, chatNamespace, activeUsers);
  socket.on("disconnect", (reason) => {
    clearInterval(heartbeatInterval);
    activeUsers.delete(user.id);
  });
});

notificationNamespace.on("connection", (socket) => {
  const user = socket.data.user;

  const heartbeatInterval = setInterval(() => {
    socket.emit("heartbeat"), 30000;
  });

  notificationHandler(socket, notificationNamespace);
  socket.on("disconnect", (reason) => {
    clearInterval(heartbeatInterval);
  });
});

webRTCNamespace.on("connection", (socket) => {
  const heartbeatInterval = setInterval(() => {
    socket.emit("heartbeat");
  }, 30000);

  socket.on("heartbeat-response", () => {
    if (activeUsers.has(socket.data.user?.userId)) {
      activeUsers.get(socket.data.user?.userId).lastActive = new Date();
    }
  });

  webRTCHandler(socket, webRTCNamespace, activeUsers);

  socket.on("disconnect", (reason) => {
    clearInterval(heartbeatInterval);
  });
});

connectDatabase();
startExpirationCron();
startBundleExpiryNotificationCron();
export { io };
export { server };
export default app;

import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export function initSocketIO(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL || "http://localhost:3000"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initSocketIO first.");
  }
  return io;
}

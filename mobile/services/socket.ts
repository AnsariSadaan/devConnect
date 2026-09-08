import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://192.168.29.61:5000";

let socket: Socket | null = null;

export const connectSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (error: any) => {
    console.log("Socket connection error:", error.message);
  });

  socket.on("messageError", (error: any) => {
    console.log("Socket message error:", error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

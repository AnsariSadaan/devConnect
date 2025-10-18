import io from 'socket.io-client';
import { BASE_URL } from './constants.js';

const SOCKET_URL =
  location.hostname === "localhost"
    ? "http://localhost:5000"
    : "/";

export const createSocketConnection = () => {
  return io(SOCKET_URL);
}
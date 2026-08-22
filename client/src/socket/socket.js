import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = () => {
  if (!socket) {
    const serverUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
    socket = io(serverUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time server with ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket.IO] Connection warning:', error.message);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocketClient();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

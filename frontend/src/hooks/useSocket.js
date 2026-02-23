import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:8000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const joinRoom = (roomId, userId) => {
    if (socket) {
      socket.emit('join-meeting', { meetingId: roomId, userId });
    }
  };

  const leaveRoom = (roomId, userId) => {
    if (socket) {
      socket.emit('leave-meeting', { meetingId: roomId, userId });
    }
  };

  const endMeeting = (roomId) => {
    if (socket) {
      socket.emit('end-meeting', { meetingId: roomId });
    }
  };

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    endMeeting,
  };
};

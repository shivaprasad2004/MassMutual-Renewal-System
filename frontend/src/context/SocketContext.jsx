import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const newSocket = io('http://localhost:5000');
      
      setSocket(newSocket);

      // Global listeners
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('policy_created', (data) => {
        toast.success(`New Policy Created: #${data.policy_number}`, {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #3b82f6',
            },
        });
      });

      newSocket.on('policy_updated', (data) => {
        toast.success(`Policy Updated: #${data.policy_number}`, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #eab308',
            },
        });
      });

      newSocket.on('policy_deleted', (id) => {
        toast.error(`Policy Deleted`, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #ef4444',
            },
        });
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

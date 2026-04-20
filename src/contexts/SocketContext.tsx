/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { baseURL } from "../services/api/api-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let newSocket: Socket | null = null;

    if (isAuthenticated && user?.id) {
      newSocket = io(baseURL, {
        query: { userId: user.id },
        transports: ["websocket"],
      });

      setSocket(newSocket);
      console.log(`🔌 Socket connected for user: ${user.id}`);
    }

    return () => {
      if (newSocket) {
        newSocket.close();
        setSocket(null);
      }
    };
  }, [isAuthenticated, user?.id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

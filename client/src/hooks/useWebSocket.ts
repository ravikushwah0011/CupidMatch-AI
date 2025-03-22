import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@/context/UserContext';

interface WebSocketHook {
  sendMessage: (type: string, data: any) => void;
  lastMessage: any | null;
  connectionStatus: 'connecting' | 'open' | 'closed' | 'error';
}

export function useWebSocket(): WebSocketHook {
  const { user } = useUser();
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) {
      setConnectionStatus('closed');
      return;
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus('open');
      // Authenticate with the server
      if (user) {
        socket.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = () => {
      setConnectionStatus('error');
    };

    socket.onclose = () => {
      setConnectionStatus('closed');
    };

    // Clean up on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user]);

  // Function to send messages through the WebSocket
  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type,
        ...data,
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  return { sendMessage, lastMessage, connectionStatus };
}

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const useWebSocket = () => {
  const wsRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        wsRef.current.send(JSON.stringify({ type: 'auth', token }));
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'enrollment_update') {
          queryClient.invalidateQueries({ queryKey: ['studentEnrollments'] });
          queryClient.invalidateQueries({ queryKey: ['facultyEnrollments'] });
          queryClient.invalidateQueries({ queryKey: ['enrollmentStats'] });
          queryClient.invalidateQueries({ queryKey: ['recentEnrollments'] });
          queryClient.invalidateQueries({ queryKey: ['facultyCourses'] });
        }
      };

      wsRef.current.onclose = () => {
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      wsRef.current.onerror = () => {
        wsRef.current.close();
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return wsRef.current;
};

export default useWebSocket;

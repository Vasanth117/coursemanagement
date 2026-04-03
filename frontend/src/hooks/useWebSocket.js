import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const useWebSocket = () => {
  const wsRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'enrollment_update':
          queryClient.invalidateQueries(['enrollmentStats']);
          queryClient.invalidateQueries(['recentEnrollments']);
          queryClient.invalidateQueries(['studentEnrollments']);
          queryClient.invalidateQueries(['facultyEnrollments']);
          // Force immediate refetch
          queryClient.refetchQueries(['studentEnrollments']);
          break;
        case 'stats_update':
          queryClient.invalidateQueries(['enrollmentStats']);
          break;
        case 'new_assignment':
          queryClient.invalidateQueries(['studentAssignments']);
          queryClient.invalidateQueries(['upcomingAssignments']);
          queryClient.invalidateQueries(['notifications']);
          break;
        default:
          break;
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return wsRef.current;
};

export default useWebSocket;
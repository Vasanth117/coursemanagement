import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyAPI } from '../api/faculty';
import { studentAPI } from '../api/student';
import { useRole } from './useRole';
import { toast } from 'react-hot-toast';

export const useAssignments = () => {
  const { isFaculty, isStudent } = useRole();
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: isFaculty ? facultyAPI.getAssignments : studentAPI.getAssignments,
    enabled: isFaculty() || isStudent()
  });

  const createAssignment = useMutation({
    mutationFn: facultyAPI.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      toast.success('Assignment created successfully');
    },
    onError: () => toast.error('Failed to create assignment')
  });

  const submitAssignment = useMutation({
    mutationFn: ({ id, data }) => studentAPI.submitAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      toast.success('Assignment submitted successfully');
    },
    onError: () => toast.error('Failed to submit assignment')
  });

  return { assignments, isLoading, createAssignment, submitAssignment };
};

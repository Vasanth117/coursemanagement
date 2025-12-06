import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyAPI } from '../api/faculty';
import { studentAPI } from '../api/student';
import { useRole } from './useRole';
import { toast } from 'react-hot-toast';

export const useCourses = () => {
  const { isFaculty, isStudent } = useRole();
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: isFaculty ? facultyAPI.getCourses : studentAPI.getEnrolledCourses,
    enabled: isFaculty() || isStudent()
  });

  const createCourse = useMutation({
    mutationFn: facultyAPI.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      toast.success('Course created successfully');
    },
    onError: () => toast.error('Failed to create course')
  });

  const updateCourse = useMutation({
    mutationFn: ({ id, data }) => facultyAPI.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      toast.success('Course updated successfully');
    },
    onError: () => toast.error('Failed to update course')
  });

  return { courses, isLoading, createCourse, updateCourse };
};

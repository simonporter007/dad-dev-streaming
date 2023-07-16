import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Task } from '@dad-dev/dad-bot';

export function useGetAllTasks() {
  return useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const res = await axios.get<Task[]>('/api/tasks');
      return res.data;
    },
    refetchInterval: 20000,
  });
}

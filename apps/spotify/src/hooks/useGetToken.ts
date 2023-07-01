import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SpotifyTokensType } from '@dad-dev/dad-bot';

export function useGetToken() {
  return useQuery({
    queryKey: ['/auth/token'],
    queryFn: async () => {
      const res = await axios.get<SpotifyTokensType>('/auth/token');
      return res.data;
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useGetToken } from './useGetToken';
import { SpotifyTrackType } from './types';

export function useGetCurrentlyPlaying() {
  const tokensQuery = useGetToken();

  return useQuery({
    queryKey: ['/api/player/currently-playing'],
    queryFn: async () => {
      const res = await axios.get<SpotifyTrackType>(
        '/api/player/currently-playing'
      );
      return res.data;
    },
    enabled: Boolean(tokensQuery.data?.accessToken),
    refetchInterval: 5000,
  });
}

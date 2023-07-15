import React from 'react';
import { useGetCurrentlyPlaying } from '../hooks/useGetCurrentlyPlaying';
import { useGetToken } from '../hooks/useGetToken';
import { Login } from './Login';
import SpotifyLogo from '../spotify-icon.png';

export function SpotifyCurrentlyPlaying() {
  const tokenQuery = useGetToken();
  const currentlyPlayingQuery = useGetCurrentlyPlaying();

  if (tokenQuery?.isLoading) {
    return null;
  }

  return tokenQuery?.data?.spotifyAccessToken ? (
    <div
      className={`grid grid-cols-[repeat(2,_minmax(0,_max-content))_1fr] gap-4 bg-gradient p-4 rounded-lg min-w-[250px] transition-opacity ease-in-out duration-1000 ${
        currentlyPlayingQuery?.data?.is_playing ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {currentlyPlayingQuery?.data?.item?.album?.images?.[0]?.url ? (
        <img
          className='h-14 w-14 rounded-lg m-auto'
          src={currentlyPlayingQuery?.data?.item?.album?.images?.[0]?.url}
        />
      ) : null}
      <div className='m-auto'>
        <div className='grid'>
          <span className='text-lg text-white'>
            {currentlyPlayingQuery?.data?.item?.name}
          </span>
          <span className='text-sm text-gray-300'>
            {currentlyPlayingQuery?.data?.item?.artists[0].name}
            {currentlyPlayingQuery?.data?.item?.album?.name
              ? ` · ${currentlyPlayingQuery?.data?.item?.album?.name}`
              : ''}
          </span>
        </div>
      </div>
      <div className='flex justify-end min-w-[50px] pl-4 -translate-y-2 translate-x-2'>
        <img src={SpotifyLogo} alt='Spotify Logo' className='h-5 w-5' />
      </div>
    </div>
  ) : (
    <Login />
  );
}

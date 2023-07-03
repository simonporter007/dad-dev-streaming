import React from 'react';
import SpotifyLogo from '../../public/spotify-icon.png';

export function Login() {
  return (
    <div className='flex justify-end max-w-fit max-h-fit p-2'>
      <a
        className='bg-black p-2 rounded-md text-white flex gap-4'
        href='/auth/spotify/login'
      >
        <img
          className='h-6 w-6 inline-flex'
          src={SpotifyLogo}
          alt='Spotify Logo'
        />
        <span className='font-bold'>Login with Spotify</span>
      </a>
    </div>
  );
}

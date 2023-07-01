import React from 'react';
import SpotifyLogo from '../../assets/spotify-icon.png';

export function Login() {
  return (
    <div className='grid place-content-center h-full'>
      <header>
        <a
          className='bg-[#1DB954] p-2 rounded-md text-white flex gap-4'
          href='/auth/login'
        >
          <img
            className='h-6 w-6 inline-flex'
            src={SpotifyLogo}
            alt='Spotify Logo'
          />
          <span className='font-bold'>Login with Spotify</span>
        </a>
      </header>
    </div>
  );
}

import React from 'react';
import { PomodoroTimer } from '@dad-dev/pomodoro';
import { SpotifyCurrentlyPlaying } from '@dad-dev/spotify';

function App() {
  return (
    <div className='grid bg-transparent h-screen grid-rows-[min-content_1fr] justify-end'>
      <div className='flex justify-end p-4'>
        <SpotifyCurrentlyPlaying />
      </div>
      <div className='flex justify-end p-4'>
        <PomodoroTimer />
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import { SpotifyCurrentlyPlaying } from './components/SpotifyCurrentlyPlaying';

function App() {
  return (
    <div className='bg-transparent flex justify-end h-fit pr-2'>
      <SpotifyCurrentlyPlaying />
    </div>
  );
}

export default App;

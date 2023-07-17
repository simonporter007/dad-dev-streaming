import React, { useEffect, useState } from 'react';
import { RainEffect } from './components/RainEffect';
import { DustEffect } from './components/DustEffect';
import { SakuraEffect } from './components/SakuraEffect';
import { useWebsocketConnection } from './hooks/useWebsocketConnection';

const effects = {
  RAIN: 'rain',
  DUST: 'dust',
  SAKURA: 'sakura',
};

function App() {
  const [effect, setEffect] = useState<string>(effects.DUST);
  const lastMessage = useWebsocketConnection();

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const parsedMessage = JSON.parse(lastMessage.data) as {
          command: string;
          message: string;
        };
        if (parsedMessage?.command === 'effect') {
          setEffect(parsedMessage?.message);
        }
      } catch (err) {
        // not JSON message, ignore
        return;
      }
    }
  }, [lastMessage, setEffect]);

  return (
    <div className='bg-transparent container'>
      {effect === effects.RAIN ? <RainEffect /> : null}
      {effect === effects.DUST ? <DustEffect /> : null}
      {effect === effects.SAKURA ? <SakuraEffect /> : null}
    </div>
  );
}

export default App;

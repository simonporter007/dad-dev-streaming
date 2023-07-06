import { useState } from 'react';
import useWebSocket from 'react-use-websocket';

export function useWebsocketConnection() {
  const [socketUrl] = useState('wss://daddevbot-websocket.simonporter.co.uk');
  const { lastMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 20,
    reconnectInterval: 3000,
  });

  return lastMessage;
}

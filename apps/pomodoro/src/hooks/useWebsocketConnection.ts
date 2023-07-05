import { useState } from 'react';
import useWebSocket from 'react-use-websocket';

export function useWebsocketConnection() {
  const [socketUrl] = useState('wss://daddevbot-websocket.simonporter.co.uk');
  const { lastMessage } = useWebSocket(socketUrl);

  return lastMessage;
}

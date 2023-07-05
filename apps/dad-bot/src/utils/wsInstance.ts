import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const wss = new WebSocketServer({ port: 5373 });
wss.on('connection', function(ws) {
    ws.send('connected')
})

export { wss };

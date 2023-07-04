import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const wsHost = process.env.BASE_URL || 'localhost';
const wss = new WebSocketServer({ host: wsHost, port: 5374 });

export { wss };

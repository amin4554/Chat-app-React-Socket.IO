import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  withCredentials: false,
  autoConnect: false // <-- important!
});

export default socket;

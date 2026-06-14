import { io } from 'socket.io-client';

const URL = 'http://localhost:3000'; // Or process.env.VITE_API_URL

export const socket = io(URL, {
    autoConnect: false,
});

export const connectSocket = (student_id) => {
    const token = localStorage.getItem('muse_token');
    socket.auth = { token };
    socket.connect();
    socket.emit('join_chat', student_id);
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

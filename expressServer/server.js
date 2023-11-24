import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { spawn } from 'node-pty';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
    const ptyProcess = spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.on('data', function(data) {
        socket.emit('command output', data);
    });

    socket.on('execute command', (command) => {
        ptyProcess.write(command + '\r');
    });

    socket.on('disconnect', () => {
        ptyProcess.kill();
    });
});

server.listen(3001, () => {
    console.log('listening on *:3001');
});
import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import './App.css';

const App: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [command, setCommand] = useState<string>('');
    const terminalRef = useRef<HTMLDivElement>(null);
    const xterm = useRef<Terminal | null>(null);

    useEffect(() => {
        xterm.current = new Terminal();
        if (terminalRef.current) {
            xterm.current.open(terminalRef.current);
        }

        const socketIo = io('http://localhost:3001');
        setSocket(socketIo);

        socketIo.on('command output', (data: string) => {
            if (xterm.current) {
                xterm.current.write(data);
                xterm.current.scrollToBottom();
            }
        });

        return () => {
            socketIo.disconnect();
            xterm.current?.dispose();
        };
    }, []);


    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (socket && command) {
            socket.emit('execute command', command);
            setCommand('');
        }
    };

    return (
        <div className="App">
            <h2 className="app-title">Command Output</h2>
            <div ref={terminalRef} className="terminal" />

            <form onSubmit={handleCommandSubmit}>
                <h2 className="app-title">Command Input</h2>
                <input
                    className="input-field"
                    placeholder="Enter a command..."
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                />
                <button type="submit" className="run-button">
                    Run
                </button>
            </form>
        </div>
    );
}

export default App;
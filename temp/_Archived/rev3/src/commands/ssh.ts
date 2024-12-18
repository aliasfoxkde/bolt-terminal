// src/commands/ssh.ts
import { Terminal } from 'xterm';

export const sshCommands = {
  ssh: async (term: Terminal, host: string) => {
    try {
      // Note: You'll need a WebSocket SSH proxy server for this to work
      const ws = new WebSocket(`ws://localhost:8080/${host}`);
      
      ws.onmessage = (event) => {
        term.write(event.data);
      };

      term.onData((data) => {
        ws.send(data);
      });

      return 'SSH connection established';
    } catch (error) {
      return `SSH error: ${error.message}`;
    }
  }
} as const;

export default sshCommands;

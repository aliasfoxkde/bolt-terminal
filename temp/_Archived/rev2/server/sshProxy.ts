// server/sshProxy.ts
import { Server } from 'ws';
import { Client } from 'ssh2';

const wss = new Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  const ssh = new Client();
  
  ssh.on('ready', () => {
    ssh.shell((err, stream) => {
      if (err) {
        ws.send(`SSH Error: ${err.message}`);
        return;
      }

      stream.on('data', (data) => {
        ws.send(data.toString());
      });

      ws.on('message', (data) => {
        stream.write(data.toString());
      });
    });
  });

  const host = req.url?.slice(1);
  ssh.connect({
    host,
    port: 22,
    username: 'user',
    // You'll need to implement proper authentication
    password: 'password'
  });
});

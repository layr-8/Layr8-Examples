// server.js
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const { Socket } = require('phoenix-channels');
const { randomUUID } = require('crypto');

// Your DIDComm configuration
const config = {
  scheme: 'wss',
  port: '4000',
  host: '',
  myDid: '',
  apiKey: '',
  recipientDid: '',
};

// Your existing DIDComm configuration
const BASIC_MESSAGE = 'https://didcomm.org/basicmessage/2.0';
const TRUST_PING = 'https://didcomm.org/trust-ping/2.0';

// Create HTTP server to serve the HTML page
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store DIDComm channel reference
let didCommChannel = null;

// Connect to DIDComm server
function connectToDIDComm(config) {
  const url = `${config.scheme}://${config.host}:${config.port}/plugin_socket`;
  const socket = new Socket(url, {
    timeout: 1000,
    params: { api_key: config.apiKey },
  });

  socket.onOpen(() => console.log('Connected to DIDComm server'));
  socket.onClose(() => console.log('Disconnected from DIDComm server'));
  socket.connect();

  const topic = `plugins:${config.myDid}`;
  const channel = socket.channel(topic, {
    payload_types: [BASIC_MESSAGE, TRUST_PING],
  });

  channel
    .join(1000)
    .receive('ok', () => console.log('Joined DIDComm channel'))
    .receive('error', (resp) => console.log('Error joining channel:', resp));

  channel.on('message', (message) => {
    if (message.plaintext.type === `${BASIC_MESSAGE}/message`) {
      const {
        from,
        body: { content },
      } = message.plaintext;
      // Broadcast received message to all web clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: 'message',
              sender: from,
              content: content,
            })
          );
        }
      });
    }
  });

  return channel;
}

// Connect to DIDComm when server starts
didCommChannel = connectToDIDComm(config);

// Handle WebSocket connections from web clients
wss.on('connection', (ws) => {
  console.log('Web client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'chat') {
      // Create DIDComm message
      const didCommMessage = {
        type: `${BASIC_MESSAGE}/message`,
        id: randomUUID(),
        from: config.myDid,
        to: [config.recipientDid],
        body: {
          content: data.content,
          locale: 'en',
        },
      };

      // Send through DIDComm channel
      didCommChannel
        .push('message', didCommMessage)
        .receive('ok', () => {
          // Broadcast sent message to all web clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: 'message',
                  sender: config.myDid,
                  content: data.content,
                })
              );
            }
          });
        })
        .receive('error', (resp) =>
          console.log('Error sending message:', resp)
        );
    }
  });

  ws.on('close', () => {
    console.log('Web client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

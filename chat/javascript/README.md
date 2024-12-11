# DIDComm Chat Client (Node.js)

There are two Node.js command-line clients for DIDComm messaging using WebSocket connections.

One is command line and the other is a simple webpage. 

You can quickly get started with the webpage by using Stackblitz
[https://stackblitz.com/github/layr-8/Layr8-Examples/tree/main/chat/javascript/webpage]

## Features

- Real-time messaging via WebSockets
- Support for multiple recipients
- DIDComm protocols support (Basic Message 2.0, Trust Ping 2.0, Report Problem 2.0)
- Automatic message acknowledgment
- API key authentication

## Prerequisites

- Node.js
- `phoenix-channels` package

## Installation

```bash
npm install phoenix-channels
```

## Usage

```bash
node chat_client.js --host <HOST> \
                   --did <YOUR_DID> \
                   --api-key <API_KEY> \
                   --recipient-did <DID1> \
                   --recipient-did <DID2>
```

### Arguments

- `--scheme`: WebSocket scheme (default: 'wss')
- `--port`: WebSocket port (default: 4000)
- `--did`: Your DID
- `--api-key`: Authentication key
- `--recipient-did`: Recipient DID(s) (multiple allowed)

### Example

```bash
node chat_client.js --host example.com \
                   --did did:example:123 \
                   --api-key abc123 \
                   --recipient-did did:example:456 \
                   --recipient-did did:example:789
```

## Commands

- Enter message and press Enter to send
- Type 'quit' to exit

## Error Handling

- Socket connection errors
- Channel join failures
- Message delivery timeouts
- Problem reports

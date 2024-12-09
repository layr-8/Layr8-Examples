# DIDComm Chat Client

A command-line chat client that implements the DIDComm messaging protocol for secure, decentralized communication.

## Features

- Real-time messaging using WebSocket connections
- Support for DIDComm protocols:
  - Basic Message 2.0
  - Trust Ping 2.0
  - Report Problem 2.0
- Automatic message acknowledgment
- Secure API key authentication

## Prerequisites

- Python 3.x
- `phxsocket` library
- Valid DID (Decentralized Identifier)
- API key for authentication

## Installation

```bash
pip install phxsocket
```

## Usage

Run the client with the following command:

```bash
python chat_client.py --host <HOST> \
                     --did <YOUR_DID> \
                     --api-key <API_KEY> \
                     --recipient-did <RECIPIENT_DID>
```

### Optional Arguments

- `--scheme`: WebSocket scheme (default: 'wss')
- `--port`: WebSocket port (default: 4000)

### Example

```bash
python chat_client.py --host example.com \
                     --did did:example:123 \
                     --api-key abc123 \
                     --recipient-did did:example:456
```

## Controls

- Type your message and press Enter to send
- Type 'quit' to exit the chat
- Use Ctrl+C to terminate the program

## Error Handling

The client includes comprehensive error handling and logging:
- Socket connection failures
- Message handling errors
- Channel communication issues

## Logging

Logging is configured at INFO level by default. Debug logs are available for detailed message tracking.

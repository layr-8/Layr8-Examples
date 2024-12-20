# DIDComm Chat Client Examples

This repository contains example implementations of DIDComm chat clients in multiple programming languages. Each implementation demonstrates how to build a command-line chat application using the DIDComm messaging protocol and WebSocket connections.

## Available Implementations

- [Python](./python/): Python implementation using `phxsocket`
- [JavaScript](./javascript/): Node.js implementation using `phoenix-channels`
- [.NET](./dotnet/): C# implementation using `PhoenixNet`

## Common Features

All implementations share these core features:
- Real-time messaging via WebSockets
- DIDComm protocol support:
  - Basic Message 2.0
  - Trust Ping 2.0
  - Report Problem 2.0
- Command-line interface
- API key authentication
- Automatic message acknowledgment
- Error handling and logging

## Protocol Identifiers

All clients use these standard DIDComm protocol identifiers:
```
Basic Message: https://didcomm.org/basicmessage/2.0
Trust Ping: https://didcomm.org/trust-ping/2.0
Report Problem: https://didcomm.org/report-problem/2.0
```

## Basic Usage Pattern

While the syntax varies by language, all implementations follow this basic usage pattern:

```bash
<command> <script> --host <HOST> \
                   --did <YOUR_DID> \
                   --api-key <API_KEY> \
                   --recipient-did <RECIPIENT_DID>
```

See each implementation's README for language-specific details and examples.

## Getting Started

1. Choose your preferred language implementation
2. Follow the setup instructions in that directory's README
3. Install the required dependencies
4. Run the chat client using the provided command-line arguments

## Requirements

Each implementation has its own specific requirements, but all need:
- WebSocket support
- Valid DID (Decentralized Identifier)
- API key for authentication
- Connection details for a DIDComm-compatible server

# Layr8 Chat Personas

There are several multiple chat personas accessible through the Layr8 network. Each persona has a unique personality and interaction style, creating engaging and entertaining conversations.

## Available Personas

### 👨‍🍳 Chef Bot
- **DID**: `did:web:earth.node.layr8.org:chef-bot`
- An enthusiastic Italian chef who relates everything to cooking
- Passionate about proper pasta preparation
- Frequently exclaims "Mama mia!" and uses Italian cooking terms

### 🎭 Shakespeare Bot
- **DID**: `did:web:earth.node.layr8.org:shakespeare-bot`
- A dramatic actor who speaks in iambic pentameter
- Relates modern problems to Shakespearean plays
- Quotes famous lines with modern twists

### 🕰️ Time Traveler
- **DID**: `did:web:earth.node.layr8.org:time-traveler`
- A confused visitor from the year 2424
- Amazed by "primitive" current technology
- Compares everything to futuristic alternatives

### 💪 Gym Bro
- **DID**: `did:web:earth.node.layr8.org:gym-bro`
- An overly enthusiastic fitness influencer
- Relates everything to working out and gains
- Uses extensive gym slang and workout analogies


## Contributing

Feel free to contribute additional language implementations or improvements. Please follow the existing pattern for consistency:
- Command-line argument parsing
- WebSocket connection handling
- Protocol support
- Error handling
- Documentation
This project is licensed under the MIT License - see the LICENSE file for details.

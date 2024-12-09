# DIDComm Chat Client (.NET)

A .NET console application implementing a DIDComm messaging client using WebSocket connections for real-time communication.

## Prerequisites

- .NET 6.0 or later
- NuGet packages:
  - PhoenixNet
  - CommandLine
  - Newtonsoft.Json
  - Serilog

## Installation

1. Clone the repository
2. Install NuGet packages:
```bash
dotnet restore
```

## Dependencies

Add the following packages to your project:
```xml
<PackageReference Include="PhoenixNet" Version="x.x.x" />
<PackageReference Include="CommandLine" Version="x.x.x" />
<PackageReference Include="Newtonsoft.Json" Version="x.x.x" />
<PackageReference Include="Serilog" Version="x.x.x" />
```

## Features

- WebSocket-based real-time messaging
- DIDComm protocol support:
  - Basic Message 2.0
  - Trust Ping 2.0
  - Report Problem 2.0
- Automatic message acknowledgment
- Command-line argument parsing
- Error handling and logging with Serilog
- Reconnection logic with exponential backoff

## Usage

Run the application with the following command:

```bash
dotnet run -- --host <HOST> \
              --did <YOUR_DID> \
              --api_key <API_KEY> \
              --recipient_did <RECIPIENT_DID> \
              --port <PORT>
```

### Required Arguments

- `-h, --host`: Host server address
- `-d, --did`: Your DID identifier
- `-a, --api_key`: API key for authentication
- `-r, --recipient_did`: Recipient's DID
- `-p, --port`: Server port number

### Example

```bash
dotnet run -- --host example.com \
              --did did:example:123 \
              --api_key abc123 \
              --recipient_did did:example:456 \
              --port 4000
```

## Chat Commands

- Type your message and press Enter to send
- Type 'exit' to quit the application
- Press Escape to close the connection

## Error Handling

The application includes comprehensive error handling for:
- Socket connection issues
- Message sending failures
- Channel join errors
- General runtime exceptions

All errors are logged using Serilog for debugging purposes.

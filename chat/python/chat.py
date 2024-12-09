import phxsocket
import uuid
import time
import sys
import json
import argparse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Protocol identifiers
BASIC_MESSAGE = "https://didcomm.org/basicmessage/2.0"
TRUST_PING = "https://didcomm.org/trust-ping/2.0"
REPORT_PROBLEM = "https://didcomm.org/report-problem/2.0"

def send_acks(channel, ids):
    try:
        channel.push("ack", {"ids": ids})

    except Exception as error:
        print("\nError sending acks:", str(error))

def build_chat_message(from_did: str, to_did: str, content: str) -> dict:
    return {
        "type": f"{BASIC_MESSAGE}/message",
        "id": str(uuid.uuid4()),
        "from": from_did,
        "to": [to_did],
        "body": {
            "content": content,
            "locale": "en"
        }
    }

def handle_message(message, channel):
    print("Got message")
    try:
        plaintext = message.get("plaintext", {})
        #data = json.loads(message)
        #plaintext = data.get("plaintext", {})
        context = message.get("context", {})

        if plaintext.get("type") == f"{BASIC_MESSAGE}/message":
            sender = plaintext.get("from")
            content = plaintext.get("body", {}).get("content")
            print(f"\n{sender}: {content}")
            send_acks(channel, [plaintext.get("id")]);
            #print(json.dumps(context, indent=4))
            print('\nEnter message (or "quit" to exit): ', end='', flush=True)

        elif plaintext.get("type") == f"{REPORT_PROBLEM}/problem-report":

            print("Problem Report")
            print(plaintext)
            #print(json.dumps(context, indent=4))
            print('\nEnter message (or "quit" to exit): ', end='', flush=True)
    except Exception as e:
        logger.error(f"Error handling message: {e}")

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Chat client')
    parser.add_argument('--scheme', default='wss', help='WebSocket scheme')
    parser.add_argument('--host', required=True, help='WebSocket host')
    parser.add_argument('--port', default=4000, type=int, help='WebSocket port')
    parser.add_argument('--did', required=True, help='Your DID')
    parser.add_argument('--api-key', required=True, help='API key')
    parser.add_argument('--recipient-did', required=True, help='Recipient DID')

    args = parser.parse_args()

    url = f"{args.scheme}://{args.host}:{args.port}/plugin_socket/websocket"
    logger.info(f"Connecting to URL: {url}")

    # Initialize socket with API key
    socket = phxsocket.Client(
        url,
        {"api_key": args.api_key}
    )

    logger.info("Connecting to socket...")
    if socket.connect():
        logger.info("Connected to socket")

        # Join channel
        channel = socket.channel(
            f"plugins:{args.did}",
            {"payload_types": [BASIC_MESSAGE, TRUST_PING, REPORT_PROBLEM]}
        )

        # Set up message handler
        #channel.on("message", handle_message)
        channel.on("message", lambda msg: handle_message(msg, channel))

        # Join the channel
        resp = channel.join()
        logger.info(f"Join response: {resp}")

        print(f"You ({args.did}) are now chatting with {args.recipient_did}")
        print("Type your messages and press Enter to send. Type 'quit' to exit.")

        while True:
            try:
                message = input('Enter message (or "quit" to exit): ')
                if message.lower() == "quit":
                    print("Closing chat...")
                    sys.exit(0)

                chat_message = build_chat_message(args.did, args.recipient_did, message)
                channel.push("message", chat_message)
                logger.debug("Message sent")

            except KeyboardInterrupt:
                print("\nClosing chat...")
                sys.exit(0)
            except Exception as e:
                logger.error(f"Error in chat loop: {e}")
    else:
        logger.error("Failed to connect to socket")
        sys.exit(1)

if __name__ == "__main__":
    main()

const { Socket } = require("phoenix-channels");
const process = require("process");
const { randomUUID } = require("crypto");
const readline = require("readline");

// Protocol identifiers
const BASIC_MESSAGE = "https://didcomm.org/basicmessage/2.0";
const trust_ping = "https://didcomm.org/trust-ping/2.0";
const REPORT_PROBLEM = "https://didcomm.org/report-problem/2.0";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const parsedArgs = {};

  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, "");
    if (key === "recipient-did") {
      // Handle multiple recipient-did arguments
      if (!parsedArgs["recipient-did"]) {
        parsedArgs["recipient-did"] = [];
      }
      if (args[i + 1] && !args[i + 1].startsWith("--")) {
        parsedArgs["recipient-did"].push(args[i + 1]);
        i++;
      }
    } else if (args[i + 1] && !args[i + 1].startsWith("--")) {
      parsedArgs[key] = args[i + 1];
      i++;
    } else {
      console.error(`Missing value for argument: ${args[i]}`);
    }
  }

  return parsedArgs;
}

const connect = (scheme, host, port) => {
  let url = `${scheme}://${host}:${port}/plugin_socket`;
  let socket = new Socket(url, {
    timeout: 1000,
    params: { api_key: api_key },
  });

  socket.onOpen(() => console.log("Connected to chat server"));
  socket.onClose((msg) => console.log("Disconnected from chat server", msg));
  socket.onError((msg) => console.log("Connection error", msg));

  console.log("Connecting to chat server at: " + url);
  socket.connect();
  return socket;
};

const join_channel = (
  socket,
  my_did,
  protocols,
  on_joined,
  on_received,
  on_problem,
) => {
  const join_timeout = 1000;
  const topic = `plugins:${my_did}`;
  let channel = socket.channel(topic, { payload_types: protocols });

  console.log("Joining chat channel: " + topic);
  channel
    .join(join_timeout)
    .receive("ok", (resp) => on_joined(channel))
    .receive("error", (resp) => console.log("Error joining channel:", resp));

  channel.onClose((msg) => console.log("Channel closed", msg));
  channel.onError((msg) => console.log("Channel error", msg));
  channel.on("message", (message) => on_received(channel, message));
  channel.on("problem", (problem) => on_problem(channel, problem));

  return channel;
};

const build_chat_message = (to_dids, content) => {
  return {
    type: `${BASIC_MESSAGE}/message`,
    id: randomUUID(),
    from: my_did,
    to: to_dids,
    body: {
      content: content,
      locale: "en",
    },
  };
};

const send_message = (channel, message) => {
  console.log("\nSending message...");
  channel
    .push("message", message, 10000)
    .receive("ok", () => console.log("Message sent successfully"))
    .receive("error", (error) =>
      console.log("\nError sending message:", error.reason),
    )
    .receive("timeout", (resp) => console.log("Timed out sending message"));
};

const send_acks = (channel, ids) => {
  console.log("\nSending acks...");
  channel
    .push("ack", { ids: ids }, 10000)
    .receive("ok", () => console.log("Acks sent successfully"))
    .receive("error", (error) =>
      console.log("\nError sending acks:", error.reason),
    );
};

const prompt_for_message = (channel, recipient_dids) => {
  rl.question('Enter message (or "quit" to exit): ', (message) => {
    if (message.toLowerCase() === "quit") {
      console.log("Closing chat...");
      rl.close();
      process.exit(0);
    }

    const chat_message = build_chat_message(recipient_dids, message);
    send_message(channel, chat_message);
    prompt_for_message(channel, recipient_dids);
  });
};

// Parse command line arguments
const args = parseCommandLineArgs();
const ws_scheme = args.scheme || "wss";
const ws_host = args.host;
const ws_port = args.port || 4000;
const my_did = args.did;
const api_key = args["api-key"];
const recipient_dids = args["recipient-did"];

console.log("api-key=${api_key}");

if (!recipient_dids || recipient_dids.length === 0) {
  console.error("Error: At least one --recipient-did argument is required");
  process.exit(1);
}

const main = () => {
  const on_joined = (channel) => {
    console.log("Connected to chat channel");
    console.log(
      `You (${my_did}) are now chatting with: ${recipient_dids.join(", ")}`,
    );
    console.log(
      "Type your messages and press Enter to send. Type 'quit' to exit.",
    );
    prompt_for_message(channel, recipient_dids);
  };

  const on_received = (channel, parsed_message) => {
    const plaintext = parsed_message.plaintext;
    const context = parsed_message.context;

    if (plaintext.type === BASIC_MESSAGE + "/message") {
      const sender = plaintext.from;
      const content = plaintext.body.content;
      console.log(`\n${sender}: ${content}`);
      console.log(JSON.stringify(context, null, 4));
      send_acks(channel, [plaintext.id]);
      rl.prompt(true);
    }

    if (plaintext.type === trust_ping + "/ping") {
      console.log("Received trust ping");
      const trust_ping_response = {
        type: trust_ping + "/ping_response",
        id: randomUUID(),
        from: my_did,
        to: [plaintext.from],
      };
      send_message(channel, trust_ping_response);
    }

    if (plaintext.type == REPORT_PROBLEM + "/problem-report") {
      console.log("Received problem report");
      console.log(JSON.stringify(plaintext, null, 4));
    }
  };

  const on_problem = (channel, problem) => {
    console.log("===== Problem =====");
    console.log(JSON.stringify(problem, null, 4));
    console.log("===================");
  };

  const socket = connect(ws_scheme, ws_host, ws_port);
  const protocols = [BASIC_MESSAGE, trust_ping, REPORT_PROBLEM];
  join_channel(socket, my_did, protocols, on_joined, on_received, on_problem);
};

main();

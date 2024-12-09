using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using PhoenixNet;
using PhoenixNet.Models;
using PhoenixNet.Logging;
using Newtonsoft.Json.Linq;
using System.Reflection.Metadata;
using Serilog;
using System.Net;
using System.Runtime.InteropServices;
using CommandLine;

namespace Layr8Chat
{
    public class Options
    {
        [Option('h', "host", Required = true, HelpText = "Host Node server.")]
        public string Host { get; set; }

        [Option('d', "did", Required = true, HelpText = "DID to connect to.")]
        public string DID { get; set; }

        [Option('a', "api_key", Required = true, HelpText = "API Key.")]
        public string api_key { get; set; }

        [Option('r', "recipient_did", Required = true, HelpText = "DID for Recipient of Messages.")]
        public string recipient_did { get; set; }

        [Option('p', "port", Required = true, HelpText = "Port on Host.")]
        public string port { get; set; }

        
    }
    class Program
    {
        static Channel channel;
        static bool isConnected = false;

        static private void SendAcks(Channel channel, IEnumerable<string> ids)
        {
            try
            {
                
                var push = new Push(channel, "ack", new { ids }, 10000);
                push.Send().Wait();
            }
            catch (Exception error)
            {
                Console.WriteLine($"\nError sending acks: {error.Message}");
            }
        }
        static async Task Main(string[] args)
        {
            string host = null, did = null, api_key = null, recipient_did = null, port = null;
            

            Parser.Default.ParseArguments<Options>(args)
                   .WithParsed<Options>(o =>
                   {
                       host = o.Host;
                       did = o.DID;
                       api_key = o.api_key;
                       recipient_did = o.recipient_did;
                       port = o.port;
                   });

                       try
            {
                Console.WriteLine("Starting application...");
                var socketUrl = $"wss://{host}:{port}/plugin_socket/websocket";

                var logger = new SerilogAdapter(Log.Logger);
                
                var socket = new Socket(socketUrl, logger, new SocketOptions
                {
                    HeartbeatIntervalMs = 30000,
                    Params = new Dictionary<string, object>
                    {
                        ["api_key"] = api_key
                    },
                    ReconnectAfterMs = tries => new[] { 1000, 2000, 5000, 10000 }[Math.Min(tries - 1, 3)]
                });

                socket.OnOpen(response =>
                {
                    try
                    {
                        channel = socket.Channel("plugins:did:web:earth.node.layr8.org:truckit-airticket-1", new Dictionary<string, object>
                        {
                            { "payload_types", new[]
                                {
                                    "https://didcomm.org/basicmessage/2.0",
                                    "https://didcomm.org/trust-ping/2.0",
                                    "https://didcomm.org/report-problem/2.0"
                                }
                            }
                        });

                        channel.On("message", response =>
                        {
                            var jObject = JObject.Parse(response.ToString());

                            Console.WriteLine(jObject["plaintext"]["type"]);

                            if (jObject["plaintext"]["type"].ToString() == "https://didcomm.org/basicmessage/2.0/message")
                            {
                                var content = jObject["plaintext"]["body"]["content"].ToString();
                                var from = jObject["plaintext"]["from"].ToString();
                                var id = jObject["plaintext"]["id"].ToString();
                                SendAcks(channel, new[] { id });
                                Console.WriteLine($"{from}: {content}");
                            }
                            else if (jObject["plaintext"]["type"].ToString() == "https://didcomm.org/report-problem/2.0/problem-report")
                            {
                                var id = jObject["plaintext"]["id"].ToString();
                              
                                Console.WriteLine("Problem Report:");
                                Console.WriteLine(jObject["plaintext"]);
                            }
                                Console.Write("\nEnter message > ");
                        });

                        channel.Join().ContinueWith(task =>
                        {
                            if (task.IsFaulted)
                            {
                                Console.WriteLine($"Join failed: {task.Exception}");
                            }
                            else
                            {
                                Console.WriteLine("Channel joined! Ready to chat.");
                                Console.Write("\nEnter message > ");
                                isConnected = true;

                                // Main input loop inside channel connected callback
                                while (true)
                                {
                                    string input = Console.ReadLine();

                                    if (input?.ToLower() == "exit")
                                        break;

                                    if (!string.IsNullOrEmpty(input))
                                    {
                                        var messagePayload = new Dictionary<string, object>
                                        {
                                            ["id"]= Guid.NewGuid().ToString(),
                                            ["from"]= did,
                                            ["to"] = new[] { "did:web:venus.node.layr8.org:demo-contractor-1" },
                                            ["type"] = "https://didcomm.org/basicmessage/2.0/message",
                                            ["body"] = new Dictionary<string, object>
                                            {
                                                ["content"] = input,
                                                ["locale"]= "en"
                                            }
                                         };

                                        var push = new Push(channel, "message", messagePayload, 10000);
                                        push.Send().Wait();
                                        //Console.WriteLine("Message sent!");
                                        Console.Write("\nEnter message > ");
                                    }
                                }
                            }
                        });
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"An error occurred: {ex.Message}");
                        Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    }
                });

                socket.OnError(response =>
                {
                    Console.WriteLine($"Socket error: {JsonSerializer.Serialize(response)}");
                });

                socket.OnClose(response =>
                {
                    isConnected = false;
                    Console.WriteLine($"Socket closed. Response: {JsonSerializer.Serialize(response)}");
                });

                await socket.ConnectAsync();

                // Keep the main thread alive
                while (!Console.KeyAvailable || Console.ReadKey().Key != ConsoleKey.Escape)
                {
                    await Task.Delay(100);
                }

                await socket.DisconnectAsync();
                Console.WriteLine("Disconnected");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }
    }
}

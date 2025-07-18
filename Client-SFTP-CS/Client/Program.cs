using MFClient.Events.Incoming;
using MFClient.Extensions;
using Newtonsoft.Json;

namespace MFClient
{
    internal class Program
    {
        static void Main()
        {
            Client? FtpClient = null;
            string? alreadyConnected = null;

            CustomReader.Event += (_, ev) =>
            {
                var data = JsonConvert.DeserializeObject<JsonTalk>(ev.Content);

                if (data is null)
                    return;

                if (data.Event == "connect")
                {
                    if (FtpClient is not null)
                    {
                        alreadyConnected ??= JsonConvert.SerializeObject(JsonTalk.CreateNew("log", "Connect already created"));
                        Console.WriteLine(alreadyConnected);
                        return;
                    }

                    Connect? @event = JsonConvert.DeserializeObject<Connect>($"{data.Args}");
                    if (@event is null)
                    {
                        alreadyConnected ??= JsonConvert.SerializeObject(JsonTalk.CreateNew("log", "[Connect Event] Missing arguments"));
                        Console.WriteLine(alreadyConnected);
                        return;
                    }
                    FtpClient = new(@event.Host, @event.Port, @event.User, @event.Password);
                }
            };

            new Thread(() => CustomReader.ReadEvent()).Start();
            Console.WriteLine("Ready");
        }
    }
}
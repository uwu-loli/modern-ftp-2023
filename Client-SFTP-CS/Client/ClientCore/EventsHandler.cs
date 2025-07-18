using MFClient.Events.Incoming;
using MFClient.Events.Out;
using MFClient.Extensions;
using Newtonsoft.Json;

namespace MFClient.ClientCore
{
    internal class EventsHandler
    {
        readonly Client _client;

        internal EventsHandler(Client client)
        {
            _client = client;
        }

        internal void Listen()
        {
            CustomReader.Event += (_, ev) =>
            {
                var data = JsonConvert.DeserializeObject<JsonTalk>(ev.Content);

                if (data is null)
                    return;

                switch (data.Event)
                {
                    case "set-working-dir":
                        {
                            try
                            {
                                _client.SetDirectory($"{data.Args}");
                            }
                            catch
                            {
                                Call("log", "[Error] Failed to change the directory to " + data.Args);
                            }
                            break;
                        }

                    case "file-upload":
                        {
                            string dir = "ERROR";
                            try
                            {
                                Upload? @event = JsonConvert.DeserializeObject<Upload>($"{data.Args}") ??
                                    throw new Exception("event is null");

                                dir = @event.Directory;
                                new Thread(() => _client.Upload(@event.Directory, @event.Path, @event.Name)).Start();
                            }
                            catch
                            {
                                Call("log", "[Error] Failed to upload to the directory " + dir);
                            }
                            break;
                        }

                    case "path-exist":
                        {
                            string path = "ERROR";
                            try
                            {
                                PathExist? @event = JsonConvert.DeserializeObject<PathExist>($"{data.Args}") ??
                                    throw new Exception("event is null");

                                path = @event.Path;
                                bool result = _client.RemotePathExist(@event.Path);
                                Call("path-exist", new PathExistToUpload()
                                {
                                    Exist = result,
                                    Directory = @event.Directory,
                                    SourcePath = @event.SourcePath,
                                    FileName = @event.FileName
                                });
                            }
                            catch
                            {
                                Call("log", "[Error] Failed to check path is exist " + path);
                            }
                            break;
                        }
                }
            };
        }

        static internal void Call(string @event, object args)
        {
            Console.WriteLine(JsonConvert.SerializeObject(JsonTalk.CreateNew(@event, args)));
        }
    }
}
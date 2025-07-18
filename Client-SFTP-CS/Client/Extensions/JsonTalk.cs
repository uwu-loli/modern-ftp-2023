using Newtonsoft.Json;

namespace MFClient.Extensions
{
    internal class JsonTalk
    {
        [JsonProperty("event")]
        internal string Event { get; set; } = string.Empty;

        [JsonProperty("args")]
        internal object? Args { get; set; }

        static internal JsonTalk CreateNew(string @event, object args)
        {
            return new JsonTalk() { Event = @event, Args = args };
        }
    }
}
using Newtonsoft.Json;

namespace MFClient.Events.Incoming
{
    internal class Upload
    {
        [JsonProperty("dir")]
        internal string Directory = string.Empty;

        [JsonProperty("path")]
        internal string Path = string.Empty;

        [JsonProperty("name")]
        internal string Name = string.Empty;
    }
}
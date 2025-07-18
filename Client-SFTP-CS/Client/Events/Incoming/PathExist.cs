using Newtonsoft.Json;

namespace MFClient.Events.Incoming
{
    internal class PathExist
    {
        [JsonProperty("path")]
        internal string Path = string.Empty;

        [JsonProperty("dir")]
        internal string Directory = string.Empty;

        [JsonProperty("sourcePath")]
        internal string SourcePath = string.Empty;

        [JsonProperty("name")]
        internal string FileName = string.Empty;
    }
}
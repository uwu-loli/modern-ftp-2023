using Newtonsoft.Json;

namespace MFClient.Events.Out
{
    internal class PathExistToUpload
    {
        [JsonProperty("exist")]
        internal bool Exist = false;

        [JsonProperty("dir")]
        internal string Directory = string.Empty;

        [JsonProperty("sourcePath")]
        internal string SourcePath = string.Empty;

        [JsonProperty("name")]
        internal string FileName = string.Empty;
    }
}
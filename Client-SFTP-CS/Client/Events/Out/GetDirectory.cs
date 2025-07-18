using Newtonsoft.Json;

namespace MFClient.Events.Out
{
    internal class GetDirectory
    {
        [JsonProperty("dir")]
        internal string Directory = string.Empty;

        [JsonProperty("files")]
        internal FilesData[] Files = Array.Empty<FilesData>();

        internal class FilesData
        {
            [JsonProperty("name")]
            internal string Name = string.Empty;

            [JsonProperty("size")]
            internal long Size = 0;

            [JsonProperty("change")]
            internal string Change = string.Empty;

            [JsonProperty("chmod")]
            internal string Chmod = string.Empty;

            [JsonProperty("rights")]
            internal string Rights = string.Empty;

            [JsonProperty("owner")]
            internal string Owner = string.Empty;

            [JsonProperty("directory")]
            internal bool Directory = false;
        }
    }
}
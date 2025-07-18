using Newtonsoft.Json;

namespace FtpClient.EventsArgs
{
    internal class Connect
    {
        [JsonProperty("host")]
        internal string Host = string.Empty;

        [JsonProperty("port")]
        internal int Port = 22;

        [JsonProperty("user")]
        internal string User = string.Empty;

        [JsonProperty("password")]
        internal string Password = string.Empty;
    }
}
using FluentFTP;
using Newtonsoft.Json;

namespace FtpClient.Extensions
{
    internal class FtpLogger : IFtpLogger
    {
        public void Log(FtpLogEntry entry)
        {
            if (entry.Severity == FtpTraceLevel.Verbose)
                return;

            string message = $"[FTP Client Log] {{{entry.Severity}}} {entry.Message}";
            if (entry.Exception is not null)
                message += " > " + entry.Exception;

            Console.WriteLine(JsonConvert.SerializeObject(JsonTalk.CreateNew("log", message)));
        }
    }
}
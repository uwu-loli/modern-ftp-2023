using FluentFTP;
using FtpClient.Extensions;
using Newtonsoft.Json;
using System.Net;
using System.Net.Security;
using System.Security.Authentication;
using System.Security.Cryptography.X509Certificates;

namespace FtpClient
{
    internal class Client
    {
        static readonly string AppDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);

        readonly FluentFTP.FtpClient _ftpClient;

        internal Client(string host, int port, NetworkCredential credential)
        {
            Console.WriteLine(JsonConvert.SerializeObject(JsonTalk.CreateNew("log", $"[FTP Client Log] Client created to host > {host}:{port}")));

            _ftpClient = new(host, credential, port, logger: new FtpLogger());

            string certPath = Path.Join(AppDataPath, "ModernFTP", "Certificates", host);
            _ftpClient.Config.EncryptionMode = FtpEncryptionMode.Explicit;
            _ftpClient.Config.SslProtocols = SslProtocols.None | SslProtocols.Tls | SslProtocols.Tls11 | SslProtocols.Tls12 | SslProtocols.Tls13;
            _ftpClient.Config.SocketKeepAlive = true;
            if (File.Exists(certPath))
                _ftpClient.Config.ClientCertificates.Add(new X509Certificate2(certPath));
            _ftpClient.ValidateCertificate += (control, e) =>
            {
                Console.WriteLine(JsonConvert.SerializeObject(JsonTalk.CreateNew("log", $"[Info] Validate Certificate > {e.PolicyErrors}")));
                if (!File.Exists(certPath))
                {
                    File.WriteAllText(certPath, e.Certificate.GetRawCertDataString());
                    e.Accept = true;
                    return;
                }
                e.Accept = e.PolicyErrors == SslPolicyErrors.None;
            };

            _ftpClient.Connect();

            Console.WriteLine(JsonConvert.SerializeObject(JsonTalk.CreateNew("log", $"[Info] Connected > {_ftpClient.IsConnected}")));
        }
    }
}
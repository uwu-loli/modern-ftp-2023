using MFClient.Events.Incoming;
using MFClient.Extensions.Methods;
using Renci.SshNet;
using Renci.SshNet.Common;
using System.Net.Sockets;
using System.Text.RegularExpressions;

namespace MFClient.ClientCore
{
    internal class CommandsHandler
    {
        readonly SshClient _client;

        internal CommandsHandler(ConnectionInfo connect, string certPath)
        {
            _client = new(connect)
            {
                KeepAliveInterval = new TimeSpan(0, 0, 0, 0, -1)
            };

            _client.HostKeyReceived += (_, e) =>
            {
                if (!Directory.Exists(Client.CertDir))
                    Directory.CreateDirectory(Client.CertDir);

                if (!File.Exists(certPath))
                {
                    File.WriteAllBytes(certPath, e.FingerPrint);
                    e.CanTrust = true;
                    return;
                }
                byte[] _bytes = File.ReadAllBytes(certPath);
                if (_bytes.Length == e.FingerPrint.Length)
                {
                    for (var i = 0; i < _bytes.Length; i++)
                    {
                        if (_bytes[i] != e.FingerPrint[i])
                        {
                            e.CanTrust = false;
                            SendInvalid();
                            break;
                        }
                    }
                }
                else
                {
                    e.CanTrust = false;
                    SendInvalid();
                }
                static void SendInvalid()
                {
                    try { EventsHandler.Call("invalid.crt", true); }
                    catch { }
                }
            };

            TryConnect();

            EventsHandler.Call("log", $"[Info] {{Commands Connection}} Connected > {_client.IsConnected}");

            new Task(() => Init()).Start();
        }

        bool TryConnect()
        {
            try
            {
                _client.Connect();
            }
            catch (SshConnectionException ex)
            {
                EventsHandler.Call("log", $"[Error] {{Commands Connection}} Disconnect Reason > {ex.DisconnectReason:F}");
                return false;
            }
            catch (SocketException ex)
            {
                EventsHandler.Call("log", $"[Error] {{Commands Connection}} Socket > {ex.SocketErrorCode:F}");
                return false;
            }
            catch (SshAuthenticationException ex)
            {
                EventsHandler.Call("log", $"[Error] {{Commands Connection}} Authentication > {ex.Message}");
                return false;
            }
            catch (ProxyException ex)
            {
                EventsHandler.Call("log", $"[Error] {{Commands Connection}} Proxy > {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                EventsHandler.Call("log", $"[Error] {{Commands Connection}} {ex.Message}");
                return false;
            }
            return true;
        }

        void CheckConnection()
        {
            try
            {
                if (!_client.IsConnected)
                {
                    EventsHandler.Call("log", $"[Info] {{Commands Connection}} Reconnecting...");

                    TryConnect();

                    EventsHandler.Call("log", $"[Info] {{Commands Connection}} Connected > {_client.IsConnected}");
                }
            }
            catch { }
        }

        internal SshCommand Exec(string command)
        {
            CheckConnection();
            return _client.RunCommand(command);
        }

        void Init()
        {
            while (true)
            {
                try { GetDisk(); } catch { }
                try { GetMem(); } catch { }
                try { GetCpu(); } catch { }
                Task.Delay(1000).Wait();
            }

            void GetDisk()
            {
                SshCommand command = Exec("df -kPT");
                var arr = Regex.Replace(command.Result, @" +", " ").Split('\n');
                try
                {
                    if (arr.TryFind(out string? inf, x => Parse(x)) && inf is not null)
                    {
                        EventsHandler.Call("stats-disk", inf);
                        return;
                    }
                    bool Parse(string x)
                    {
                        if (x is null)
                            return false;

                        string[] arr = x.Split(' ');
                        if (arr.Length < 7)
                            return false;

                        return arr[6] == "/";
                    }
                }
                catch { }
                foreach (string pre in arr)
                {
                    try
                    {
                        if (ParseArr(pre.Split(' ')))
                        {
                            EventsHandler.Call("stats-disk", pre);
                            return;
                        }
                    }
                    catch { }
                }

                static bool ParseArr(string[] info)
                {
                    if (info[0].StartsWith("/") || info[6] == "/" || info[0].IndexOf('/') > 0 || info[0].IndexOf(':') == 1)
                    {
                        int used = int.Parse(info[3]) * 1024;
                        int available = int.Parse(info[4]) * 1024;
                        int use = 100 * used / (used + available);
                        if ((used > 0 || available > 0) && use > 0)
                        {
                            return true;
                        }
                    }
                    return false;
                }
            }

            void GetMem()
            {
                SshCommand command = Exec("free");
                var arr = Regex.Replace(command.Result, @" +", " ").Split('\n');
                try
                {
                    if (arr.TryFind(out string? inf, x => x.StartsWith("Mem")) && inf is not null)
                    {
                        EventsHandler.Call("stats-mem", inf);
                        return;
                    }
                }
                catch { }
            }

            void GetCpu()
            {
                SshCommand command = Exec("vmstat 1 2 | tail -1");
                string res = Regex.Replace(command.Result, @" +", " ");
                EventsHandler.Call("stats-cpu", res);
            }
        }
    }
}
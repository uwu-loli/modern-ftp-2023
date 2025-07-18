using MFClient.ClientCore;
using MFClient.Events.Incoming;
using MFClient.Events.Out;
using MFClient.Extensions;
using MFClient.Extensions.Methods;
using Newtonsoft.Json;
using Renci.SshNet;
using Renci.SshNet.Common;
using Renci.SshNet.Sftp;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using static MFClient.Events.Out.GetDirectory;

namespace MFClient
{
    internal class Client
    {
        static internal readonly string AppDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        static internal readonly string CertDir = Path.Join(AppDataPath, "ModernFileTransfer", "Certificates");

        readonly string certPath;

        readonly ConnectionInfo connect;
        readonly EventsHandler _events;
        readonly CommandsHandler? _command;

        SftpClient _client;

        string _latest = "/";
        string LatestWorkDirectory
        {
            get
            {
                if (!_latest.EndsWith("/"))
                    _latest += "/";

                return _latest;
            }
            set => _latest = value;
        }

        readonly Dictionary<SftpClient, AliveConnect> AliveClients = new();

        internal Client(string host, int port, string user, string password)
        {
            connect = new(host, port, user, new PasswordAuthenticationMethod(user, password));
            certPath = Path.Join(CertDir, $"{user}@{host}:{port}".CreateSha256());
            _events = new EventsHandler(this);

            EventsHandler.Call("log", $"[Info] Connecting to host > {user}@{host}:{port}");

            _client = new SftpClient(connect);
            if (!CreateConnect(_client))
                return;

            _client.KeepAliveInterval = new TimeSpan(0, 0, 0, 0, -1);


            try { LatestWorkDirectory = _client.WorkingDirectory; } catch { }

            EventsHandler.Call("info-connected", true);
            EventsHandler.Call("log", $"[Info] {{SFTP Connection}} Connected > {_client.IsConnected}");

            _command = new CommandsHandler(connect, certPath);

            new Task(() => SendDirectory()).Start();

            _events.Listen();
        }

        bool CheckConnected()
        {
            try
            {
                if (!_client.IsConnected)
                {
                    EventsHandler.Call("log", $"[Info] {{SFTP Connection}} Reconnecting...");

                    _client.Connect();
                    _client.ChangeDirectory(LatestWorkDirectory);

                    EventsHandler.Call("log", $"[Info] {{SFTP Connection}} Connected > {_client.IsConnected}");
                }
                EventsHandler.Call("info-connected", true);
                return true;
            }
            catch { }

            try
            {
                _ = _client.BufferSize;
                EventsHandler.Call("info-connected", true);
                return true;
            }
            catch { }

            EventsHandler.Call("log", $"[Info] {{SFTP Connection}} Reconnecting...");

            try { _client.Disconnect(); } catch { }
            try { _client.Dispose(); } catch { }

            _client = new SftpClient(connect);
            if (!CreateConnect(_client))
                return false;

            _client.ChangeDirectory(LatestWorkDirectory);

            EventsHandler.Call("log", $"[Info] {{SFTP Connection}} Connected > {_client.IsConnected}");
            EventsHandler.Call("info-connected", true);

            return true;
        }

        bool CreateConnect(SftpClient client)
        {
            client.HostKeyReceived += (_, e) =>
            {
                if (!Directory.Exists(CertDir))
                    Directory.CreateDirectory(CertDir);

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

            try
            {
                client.Connect();
            }
            catch (SshConnectionException ex)
            {
                EventsHandler.Call("info-connected", false);
                EventsHandler.Call("log", $"[Error] {{SFTP Connection}} Disconnect Reason > {ex.DisconnectReason:F}");
                return false;
            }
            catch (SocketException ex)
            {
                EventsHandler.Call("info-connected", false);
                EventsHandler.Call("log", $"[Error] {{SFTP Connection}} Socket > {ex.SocketErrorCode:F}");
                return false;
            }
            catch (SshAuthenticationException ex)
            {
                EventsHandler.Call("info-connected", false);
                EventsHandler.Call("log", $"[Error] {{SFTP Connection}} Authentication > {ex.Message}");
                return false;
            }
            catch (ProxyException ex)
            {
                EventsHandler.Call("info-connected", false);
                EventsHandler.Call("log", $"[Error] {{SFTP Connection}} Proxy > {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                EventsHandler.Call("info-connected", false);
                EventsHandler.Call("log", $"[Error] {{SFTP Connection}} {ex.Message}");
                return false;
            }
            return true;
        }

        void SendDirectory()
        {
            string _dir = LatestWorkDirectory;

            EventsHandler.Call("log", $"[Info] Receiving files from the directory {_dir}");

            if (!CheckConnected())
            {
                EventsHandler.Call("info-connected", false);
                return;
            }

            GetDirectory ev = new() { Directory = _dir };
            List<FilesData> _list = new();

            IEnumerable<SftpFile> files = _client.ListDirectory(_dir, (int count) =>
            {
                EventsHandler.Call("log", $"[Info] Received {count} files from the directory {_dir}");
            });

            EventsHandler.Call("log", $"[Info] Processing {files.Count()} files from the directory {_dir}");

            foreach (SftpFile file in files.OrderBy(f => f.Name))
            {
                if (file.Name is "." or "..")
                    continue;

                if (!file.IsRegularFile && !file.IsDirectory)
                    continue;

                _list.Add(new()
                {
                    Name = file.Name,
                    Size = file.Length,
                    Change = file.LastWriteTime.ConvertDate(),
                    Chmod = file.GetChmod(),
                    Rights = file.GetRights(),
                    Owner = file.UserId.GetUser(_command) + " " + file.GroupId.GetGroup(_command),
                    Directory = file.IsDirectory,
                });
            }

            EventsHandler.Call("log", $"[Info] Processed {_list.Count} files from the directory {_dir}");

            ev.Files = _list.ToArray();
            _list.Clear();

            EventsHandler.Call("get-directory", ev);
        }

        internal void SetDirectory(string dir)
        {
            EventsHandler.Call("log", $"[Info] Changing directory to {dir}");

            if (!CheckConnected())
            {
                EventsHandler.Call("info-connected", false);
                return;
            }

            _client.ChangeDirectory(dir);
            LatestWorkDirectory = dir;
            SendDirectory();
        }

        internal bool RemotePathExist(string path)
        {
            if (!CheckConnected())
            {
                EventsHandler.Call("info-connected", false);
                return false;
            }

            EventsHandler.Call("log", $"[Info] Checking for the existence of a path \"{path}\"");
            return _client.Exists(path);
        }

        internal void Upload(string remote, string path, string name)
        {
            EventsHandler.Call("log", $"[Info] Uploading to {remote}");

            if (!CheckConnected())
            {
                EventsHandler.Call("info-connected", false);
                return;
            }

            if (!File.Exists(path) && !Directory.Exists(path))
            {
                EventsHandler.Call("log", $"[Info] Not found path \"{path}\"");
                return;
            }

            if (!remote.EndsWith("/"))
                remote += "/";

            if (Directory.Exists(path))
            {
                var client = SafeCreateClient();
                AliveClients.Add(client, new(string.Empty, true));

                uploadDir(Path.Combine(remote, name), path, remote, client);

                Thread.Sleep(1000);
                while (client is not null
                    && AliveClients.TryGetValue(client, out AliveConnect? @ev)
                    && @ev is not null && @ev.Alive)
                    Thread.Sleep(500);

                if (client is not null)
                {
                    if (client != _client)
                    {
                        try { client.Disconnect(); } catch { }
                        try { client.Dispose(); } catch { }
                    }
                    AliveClients.Remove(client);
                }
            }
            else
            {
                var date1 = DateTime.Now;
                SftpClient? client = null;
                if (new FileInfo(path).Length > 52428800) // 50mb
                    client = SafeCreateClient();
                uploadFile(remote, path, name, true, client: client);

                if (client is not null && client != _client)
                {
                    try { client.Disconnect(); } catch { }
                    try { client.Dispose(); } catch { }
                }

                SendDirectory();

                EventsHandler.Call("log", $"[Info] Uploaded file with \"{(DateTime.Now - date1).TotalSeconds}\" seconds");
            }

            SftpClient SafeCreateClient()
            {
                SftpClient client = new(connect);
                if (!CreateConnect(client))
                {
                    try { client.Dispose(); } catch { }
                    client = _client;
                }
                return client;
            }

            void uploadFile(string remote, string local, string name, bool sync = false, SftpClient? client = null)
            {
                if (!File.Exists(local))
                    return;

                client ??= _client;

                EventsHandler.Call("log", $"[Debug] Uploading file to {Path.Combine(remote, name)}");

                if (sync) PostMethod();
                else new Task(() => PostMethod()).Start();

                void PostMethod()
                {
                    if (client != _client && AliveClients.TryGetValue(client, out AliveConnect? @ev1))
                    {
                        @ev1.File = remote + local + name;
                        @ev1.Alive = true;
                    }

                    using Stream stream = File.Open(local, FileMode.Open);
                    try { client.UploadFile(stream, Path.Combine(remote, name)); }
                    catch { EventsHandler.Call("log", "[Error] Failed to upload to the directory " + remote); }
                    stream.Close();

                    if (client != _client && AliveClients.TryGetValue(client, out AliveConnect? @ev2))
                    {
                        if (@ev2 is not null && @ev2.File == remote + local + name)
                            @ev2.Alive = false;
                    }
                }
            }
            void uploadDir(string remote, string local, string source, SftpClient client)
            {
                if (!Directory.Exists(local))
                    return;

                if (!remote.EndsWith("/"))
                    remote += "/";

                EventsHandler.Call("log", $"[Debug] Uploading directory to {remote}");

                try { client.CreateDirectory(remote); } catch { }

                foreach (string path in Directory.EnumerateFiles(local))
                {
                    string file = Path.GetFileName(path);
                    uploadFile(remote, path, file, client: client);
                }
                foreach (string path in Directory.EnumerateDirectories(local))
                {
                    string file = Path.GetFileName(path);
                    uploadDir(Path.Combine(remote, file), path, remote, client);
                }

                try
                {
                    if (LatestWorkDirectory.StartsWith(source) &&
                        Math.Abs(LatestWorkDirectory.Length - source.Length) < 2)
                        SendDirectory();
                }
                catch { }
            }
        }
    }
}
using MFClient.ClientCore;
using Renci.SshNet;

namespace MFClient.Extensions.Methods
{
    static class Users
    {
        static readonly Dictionary<int, string> _users = new();
        static readonly Dictionary<int, string> _groups = new();

        static internal string GetUser(this int userid, CommandsHandler? _command)
        {
            if (_command is null)
                return userid.ToString();

            try
            {
                if (_users.TryGetValue(userid, out string? res))
                    return res;

                SshCommand command = _command.Exec("id -nu " + userid);

                if (command.ExitStatus == 1)
                    return userid.ToString();

                string result = command.Result.Replace("\n", "");

                if (!_users.ContainsKey(userid))
                    _users.Add(userid, result);

                return result;
            }
            catch
            {
                return userid.ToString();
            }
        }

        static internal string GetGroup(this int groupid, CommandsHandler? _command)
        {
            if (_command is null)
                return groupid.ToString();

            try
            {
                if (_groups.TryGetValue(groupid, out string? res))
                    return res;

                SshCommand command = _command.Exec("id -ng " + groupid);

                if (command.ExitStatus == 1)
                    return groupid.ToString();

                string result = command.Result.Replace("\n", "");

                if (!_groups.ContainsKey(groupid))
                    _groups.Add(groupid, result);

                return result;
            }
            catch
            {
                return groupid.ToString();
            }
        }
    }
}
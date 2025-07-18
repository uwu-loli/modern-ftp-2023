using Renci.SshNet.Sftp;

namespace MFClient.Extensions.Methods
{
    static class Rights
    {
        static internal string GetChmod(this SftpFile file)
        {
            uint value = 0;

            if (file.OwnerCanRead)
                value += 400;
            if (file.OwnerCanWrite)
                value += 200;
            if (file.OwnerCanExecute)
                value += 100;

            if (file.GroupCanRead)
                value += 40;
            if (file.GroupCanWrite)
                value += 20;
            if (file.GroupCanExecute)
                value += 10;

            if (file.OthersCanRead)
                value += 4;
            if (file.OthersCanWrite)
                value += 2;
            if (file.OthersCanExecute)
                value += 1;

            return value.ToString("000");
        }
        static internal string GetRights(this SftpFile file)
        {
            string value = "-";

            if (file.OwnerCanRead)
                value += "r";
            else value += "-";
            if (file.OwnerCanWrite)
                value += "w";
            else value += "-";
            if (file.OwnerCanExecute)
                value += "x";
            else value += "-";

            if (file.GroupCanRead)
                value += "r";
            else value += "-";
            if (file.GroupCanWrite)
                value += "w";
            else value += "-";
            if (file.GroupCanExecute)
                value += "x";
            else value += "-";

            if (file.OthersCanRead)
                value += "r";
            else value += "-";
            if (file.OthersCanWrite)
                value += "w";
            else value += "-";
            if (file.OthersCanExecute)
                value += "x";
            else value += "-";

            return value;
        }
    }
}
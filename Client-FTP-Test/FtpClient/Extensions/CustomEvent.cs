namespace FtpClient.Extensions
{
    internal class CustomEvent : EventArgs
    {
        internal string Content { get; }

        internal CustomEvent(string str)
        {
            Content = str;
        }
    }
}
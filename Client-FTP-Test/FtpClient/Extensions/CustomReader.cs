namespace FtpClient.Extensions
{
    static internal class ConsoleReader
    {
        static internal event EventHandler<CustomEvent>? Event;

        static internal void ReadEvent()
        {
            while (true)
            {
                string? text = Console.ReadLine();

                if (text is null)
                    continue;

                Event?.Invoke(null, new(text));
            }
        }
    }
}
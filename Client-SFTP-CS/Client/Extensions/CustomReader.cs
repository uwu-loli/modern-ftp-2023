namespace MFClient.Extensions
{
    static internal class CustomReader
    {
        static internal event EventHandler<CustomEvent>? Event;

        static internal void ReadEvent()
        {
            while (true)
            {
                string? text = Console.ReadLine();

                if (text is not null)
                    Event?.Invoke(null, new(text));
            }
        }
    }
}
using System.Security.Cryptography;
using System.Text;

namespace MFClient.Extensions.Methods
{
    static class Global
    {
        static internal string ConvertDate(this DateTime date)
        {
            return date.ToString("dd.MM.yyyy HH:mm:ss");
        }
        static internal bool TryFind<TSource>(this IEnumerable<TSource> source, out TSource? found, Func<TSource, bool> predicate)
        {
            foreach (TSource t in source)
            {
                if (predicate(t))
                {
                    found = t;
                    return true;
                }
            }
            found = default;
            return false;
        }

        static internal string CreateSha256(this string str)
        {
            using SHA256 sha256Hash = SHA256.Create();
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(str));

            StringBuilder builder = new();
            for (int i = 0; i < bytes.Length; i++)
            {
                builder.Append(bytes[i].ToString("x2"));
            }
            return builder.ToString();
        }
    }
}
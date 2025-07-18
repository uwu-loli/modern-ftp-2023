using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MFClient.Extensions
{
    class AliveConnect
    {
        internal string File { get; set; }
        internal bool Alive
        {
            get => _alive;
            set
            {
                _alive = value;
                lastChange = DateTime.Now;
            }
        }

        bool _alive;
        DateTime lastChange = DateTime.Now;
        internal AliveConnect(string file, bool alive)
        {
            File = file;
            Alive = alive;

            new Task(() =>
            {
                while ((DateTime.Now - lastChange).TotalSeconds > 15)
                    Task.Delay(1000).Wait();
                _alive = false;
            }).Start();
        }
    }
}
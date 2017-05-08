using Discord;
using Discord.WebSocket;
using RobbieBotten.Discord;
using RobbieBotten.Util;
using System;
using System.Threading.Tasks;

namespace RobbieBotten {
    public class EntryPoint {
        public static void Main(string[] args) {
            Console.Title = "Robbie Botten";

            Bot bot = new Bot();
            try {
                bot.Start().GetAwaiter().GetResult();
            } catch (Exception e) {
                Logger.Error(e.Message);
            }
            Logger.Warn("Press any key to continue...");
            Console.ReadKey();
        }
    }
}
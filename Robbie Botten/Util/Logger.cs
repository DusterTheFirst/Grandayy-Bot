using Discord;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Util {
    public static class Logger {
        public static Task Log(LogMessage m) {
            switch (m.Severity) {
                case LogSeverity.Critical:
                    Log(m, ConsoleColor.DarkRed);
                    break;
                case LogSeverity.Debug:
                    Log(m, ConsoleColor.Gray);
                    break;
                case LogSeverity.Error:
                    Log(m, ConsoleColor.Red);
                    break;
                case LogSeverity.Info:
                    Log(m, ConsoleColor.White);
                    break;
                case LogSeverity.Verbose:
                    Log(m, ConsoleColor.DarkYellow);
                    break;
                case LogSeverity.Warning:
                    Log(m, ConsoleColor.Yellow);
                    break;
            }
            return Task.CompletedTask;
        }
        public static void Log(LogMessage m, ConsoleColor c) => Log($"[{m.Severity}][{m.Source}] {m.Message}{m.Exception}", c);
        public static void Log(object message, ConsoleColor color = ConsoleColor.White, ConsoleColor highlight = ConsoleColor.Black) {
            ConsoleColor priorf = Console.ForegroundColor;
            ConsoleColor priorb = Console.BackgroundColor;

            Console.ForegroundColor = color;
            Console.BackgroundColor = highlight;

            Console.WriteLine($"[{DateTime.Now.ToShortDateString()} {DateTime.Now.ToLongTimeString()}]{message}");

            Console.ForegroundColor = priorf;
            Console.BackgroundColor = priorb;
        }

        public static void Error(object message) {
            Log($"[Error]{message}", ConsoleColor.Red);
            //Console.Beep();
        }
        public static void Warn(object message) {
            Log($"[Warn]{message}", ConsoleColor.Yellow);
            //Console.Beep();
        }
    }
}

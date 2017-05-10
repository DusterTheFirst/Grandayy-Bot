using Discord;
using Discord.WebSocket;
using Discord.Commands;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Tweetinvi;
using Tweetinvi.Models;
using Google.Apis.Auth.OAuth2;
using Google.Apis.YouTube.v3;
using Google.Apis.Services;
using System.Threading;
using Google.Apis.Util.Store;
using Grandayy.Discord;
using Grandayy.Config;

namespace Grandayy {
    class Program {

        public static CommandService commands;
        public static CommandService DMcommands;
        private static DiscordSocketClient client;
        private static DependencyMap map;

        public static ConfigFile Config;
        public static ConfigManager ConfigManager;

        public static SocketTextChannel AnnouncementsChannel;
        public static SocketTextChannel CommandChannel;

        Tweetinvi.Models.IUser Grandayy;
        IEnumerable<ITweet> GrandayyTimeline;

        public static void Main(string[] args) =>
            new Program().MainAsync().GetAwaiter().GetResult();

        public async Task MainAsync() {
            //File.WriteAllText("console.log", "");

            ConfigManager = new ConfigManager();

            ConfigManager.OnFileNotFound += (sender, file) => {
                MessageBox.Show($"Missing file, {file}, the file has been created and needs to be filled out");
                Environment.Exit(404);
            };

            Config = ConfigManager.Load();

            client = new DiscordSocketClient();
            map = new DependencyMap();
            commands = new CommandService();
            DMcommands = new CommandService();

            client.Log += Log;
            client.Ready += Ready;

            await InstallCommands();

            try {
                await client.LoginAsync(TokenType.Bot, Config.BotToken);
                await client.StartAsync();
            } catch (Exception e) {
                Error(e);
            }

            TweetinviEvents.QueryBeforeExecute += (sender, args) => {
                var queryRateLimits = RateLimit.GetQueryRateLimit(args.QueryURL);

                // Some methods are not RateLimited. Invoking such a method will result in the queryRateLimits to be null
                if (queryRateLimits != null) {
                    if (queryRateLimits.Remaining < 500) {
                        Warn($"{queryRateLimits.Remaining} Requests Avaliable Until {queryRateLimits.ResetDateTime}");
                    }
                    if (queryRateLimits.Remaining > 0) {
                        return;
                    }

                    args.Cancel = true;
                    Error($"We Are Being Rate Limited, Please Wait Until {queryRateLimits.ResetDateTime}");

                }
            };

            // Block this task until the program is closed.
            await Task.Delay(-1);
        }

        public Task Ready() {
            Auth.SetUserCredentials(Config.TwitterAPI.ConsumerKey, Config.TwitterAPI.ConsumerSecret, Config.TwitterAPI.UserAccessToken, Config.TwitterAPI.UserAccessSeceret);

            AnnouncementsChannel = (client.GetChannel(Config.Channels.AnnouncementsChannel) as SocketTextChannel);
            CommandChannel = (client.GetChannel(Config.Channels.CommandChannel) as SocketTextChannel);

            client.SetGameAsync($"{Config.CommandPrefix}help for help");

            var timer = new System.Timers.Timer(Config.SocialTick) {
                Enabled = true
            };
            timer.Elapsed += async (sender, args) => {
                try {
                    await TwitterTick(args.SignalTime.Millisecond);
                    await YoutubeTick(args.SignalTime.Millisecond);
                } catch (Exception e) { 
                    Log($"FAILED TO UPDATE SOCIAL MEDIA, {e.Message}");
                }
                //Log("Checked Social Media");
            };
            timer.Start();

            return Task.CompletedTask;
        }

        public async Task TwitterTick(int Elapsed) {
            if (Grandayy == null) Grandayy = User.GetUserFromId(Config.TwitterAccout);

            GrandayyTimeline = Timeline.GetUserTimeline(Grandayy.Id, 10);

            foreach (ITweet t in GrandayyTimeline.Where(t => t.CreatedAt.ToUniversalTime() > DateTime.UtcNow.AddMilliseconds(-Elapsed))) {
                await AnnouncementsChannel.SendMessageAsync("", false, new EmbedBuilder() {
                    Url = t.Url,
                    Description = t.Text,
                    Timestamp = t.CreatedAt.ToUniversalTime(),
                    ThumbnailUrl = Grandayy.ProfileImageUrl400x400,
                    Title = $"{Grandayy.Name} has a message for his disciples",
                    Color = new Color(66, 134, 244)
                });
                Log($"{Grandayy.Name} posted {t.Text}");
            }

        }
        public async Task YoutubeTick(int elapsed) {
            foreach (KeyValuePair<string, string> p in Config.YoutubeAccounts) {
                await AlertVid(p.Key, p.Value, elapsed);
            }
        }

        public async Task AlertVid(string channelname, string id, int elapsed) {
            var yt = new YouTubeService(new BaseClientService.Initializer() { ApiKey = Config.YoutubeAPI.APIKey });
            var channelsListRequest = yt.Channels.List("contentDetails");
            channelsListRequest.Id = id;
            var channelsListResponse = channelsListRequest.Execute();
            foreach (var channel in channelsListResponse.Items) {
                // of videos uploaded to the authenticated user's channel.
                var uploadsListId = channel.ContentDetails.RelatedPlaylists.Uploads;
                var playlistItemsListRequest = yt.PlaylistItems.List("snippet");
                playlistItemsListRequest.PlaylistId = uploadsListId;
                playlistItemsListRequest.MaxResults = 5;
                // Retrieve the list of videos uploaded to the authenticated user's channel.
                var playlistItemsListResponse = playlistItemsListRequest.Execute();
                foreach (var playlistItem in playlistItemsListResponse.Items) {
                    // Print information about each video.
                    if (playlistItem.Snippet.PublishedAt.Value.ToUniversalTime() > DateTime.UtcNow.AddMilliseconds(-elapsed)) {
                        Log($"New Video By {channelname}, {playlistItem.Snippet.Title}");

                        await AnnouncementsChannel.SendMessageAsync($"@everyone, {channelname} has a new piece of art to share with you mortals\nhttps://www.youtube.com/watch?v={playlistItem.Snippet.ResourceId.VideoId}");
                    }

                }
            }
        }

        public async Task InstallCommands() {
            // Hook the MessageReceived Event into our Command Handler
            client.MessageReceived += HandleCommand;
            // Discover all of the commands in this assembly and load them.
            await commands.AddModuleAsync<CommandModule>();

            await DMcommands.AddModuleAsync<DMModule>();

            Log("Avaliable DMCommands:" + string.Join(", ", DMcommands.Commands.Select(x => x.Name)));
            Log("Avaliable Commands:" + string.Join(", ", commands.Commands.Select(x => x.Name)));

        }
        public async Task HandleCommand(SocketMessage messageParam) {
            // Don't process the command if it was a System Message
            var message = messageParam as SocketUserMessage;
            if (message == null) return;

            if (message.Channel is IDMChannel) {
                await HandleDM(message);
                return;
            }

            // Create a number to track where the prefix ends and the command begins
            int argPos = 0;
            // Determine if the message is a command, based on if it starts with '!' or a mention prefix
            if (!message.HasCharPrefix(Config.CommandPrefix, ref argPos)) return;
            if (message.Author.IsBot) return;

            //if (Limiter.IsRatelimited(message.Author)) return;

            Log($"User {message.Author.Username} Executed {message.Content}");

            await message.DeleteAsync();

            if (message.Channel.Id != (Config.Channels.CommandChannel == 0 ? message.Channel.Id : Config.Channels.CommandChannel)) {
                await message.Channel.SendMessageAsync(CommandChannel.Mention, false, new EmbedBuilder() {
                    Title = $"This channel is not meant for using bot commands, please use the given channel",
                    Color = new Color((int) MsgLevel.Error)
                });
                return;
            }

            // Create a Command Context
            var context = new CommandContext(client, message);
            // Execute the command. (result does not indicate a return value, 
            // rather an object stating if the command executed succesfully)
            var result = await commands.ExecuteAsync(context, argPos, map);
            if (!result.IsSuccess)
                switch (result.ErrorReason) {
                    case "Unknown command.":
                        await context.Channel.SendMessageAsync("", false, new EmbedBuilder() {
                            Description = "**WHAT ARE YOU DOING!?** *ugh* Let's try something else",
                            Title = $"Command {message.Content.Split(' ')[0]} not found",
                            Color = new Color((int) MsgLevel.Error)
                        });
                        break;
                    default:
                        await context.Channel.SendMessageAsync($"{client.GetUser(168827261682843648).Mention}\n{result.ErrorReason}");
                        break;
                }
        }
        private async Task HandleDM(SocketUserMessage message) {
            if (message.Author.IsBot) return;

            if (!Config.DMWhitlist.Contains(message.Author.Id)) {
                await message.Channel.SendMessageAsync("", false, new EmbedBuilder() {
                    Title = "STRANGER DANGER",
                    Color = new Color((int) MsgLevel.Warn)
                });
                Log($"User {message.Author.Username} Attempted To DM '{message.Content}'");
                return;
            }
            Log($"User {message.Author.Username} DMed '{message.Content}'");

            // Create a Command Context
            var context = new CommandContext(client, message);
            // Execute the command. (result does not indicate a return value, 
            // rather an object stating if the command executed succesfully)
            var result = await DMcommands.ExecuteAsync(context, 0, map);
            if (!result.IsSuccess)
                await context.Channel.SendMessageAsync($"{result.ErrorReason}");

        }

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
            Log($"[Error][Bot] {message}", ConsoleColor.Red);
        }
        public static void Warn(object message) {
            Log($"[Warn][Bot] {message}", ConsoleColor.Yellow);
        }

        [Obsolete]
        public static void Audit(object message, MsgLevel level, SocketGuildUser user = null) {
            //Task.Run(async () => {
            //    try {
            //        string msg = "";
            //        if (level != MsgLevel.Good) msg = "<@168827261682843648>";
            //        await LogChannel.SendMessageAsync(msg, false, new EmbedBuilder() {
            //            Footer = new EmbedFooterBuilder() {
            //                IconUrl = client.CurrentUser.GetAvatarUrl(),
            //                Text = client.CurrentUser.Username
            //            },
            //            ThumbnailUrl = user?.GetAvatarUrl(),
            //            Description = message.ToString(),
            //            Timestamp = DateTime.UtcNow,
            //            Color = new Color((uint) level)
            //        });
            //    } catch {

            //    }
            //});
            /// TODO: LOG TO DATABASE FOR CHECK LATER (DM ONLY)
        }

    }
}
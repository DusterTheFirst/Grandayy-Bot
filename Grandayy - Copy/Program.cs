﻿using Discord;
using Discord.WebSocket;
using Discord.Commands;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using Tweetinvi;
using Tweetinvi.Models;
using Google.Apis.Auth.OAuth2;
using Google.Apis.YouTube.v3;
using Google.Apis.Services;
using System.Threading;
using Google.Apis.Util.Store;
using Grandayy.Discord;

namespace Grandayy {
    class Program {

        public static CommandService commands;
        private DiscordSocketClient client;
        private DependencyMap map;

        public static SocketTextChannel AnnouncementsChannel;
        public static SocketTextChannel LogChannel;
        public static SocketTextChannel CommandChannel;

        Tweetinvi.Models.IUser Grandayy;
        IEnumerable<ITweet> GrandayyTimeline;

        private const uint UPDATEMS = 15000;

        public string BotToken = "";
        public const ulong AnnounceC = 306327827467468800;
        public const ulong LogC = 306095178454794240;
        public const ulong CommandC = 306097452090523652;
        public const long GrandayyID = 365956744;

        public const char Prefix = '/';

        public static void Main(string[] args) =>
            new Program().MainAsync().GetAwaiter().GetResult();

        public async Task MainAsync() {
            File.WriteAllText("console.log", "");

            try {
                BotToken = File.ReadAllText("token.txt");
            } catch (FileNotFoundException) {
                Error("You NEED A 'token.txt' File In The Directory With The Bot");
            }

            client = new DiscordSocketClient();
            map = new DependencyMap();
            commands = new CommandService();

            client.Log += Log;
            client.Ready += Ready;

            await InstallCommands();

            try {
                await client.LoginAsync(TokenType.Bot, BotToken);
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
            Auth.SetUserCredentials("vtlPMsuftuCZtkDCCVWix9y03", "pchZwV9cknPfoYNC6ZIzlfWY1QslRqXSNi1Pt5OrhgS4nhWUS9", "764500257342300160-Wm2UfG49AXTXbUE5F0UKrV3bK28geoz", "3rNPO7sQCqfeRScEx1D7DEIwaztSuaOqRouCAYGo20z1I");

            AnnouncementsChannel = (client.GetChannel(AnnounceC) as SocketTextChannel);
            LogChannel = (client.GetChannel(LogC) as SocketTextChannel);
            CommandChannel = (client.GetChannel(CommandC) as SocketTextChannel);

            client.SetGameAsync("/help for help");

            Grandayy = User.GetUserFromId(GrandayyID);

            var timer = new System.Timers.Timer(UPDATEMS) {
                Enabled = true
            };
            timer.Elapsed += async (sender, args) => {
                try {
                    await TwitterTick();
                    await YoutubeTick();
                } catch (Exception e) {
                    await Audit($"FAILED TO UPDATE SOCIAL MEDIA, {e.Message}", MsgLevel.Error);
                }
            };
            timer.Start();

            return Task.CompletedTask;
        }

        public async Task TwitterTick() {
            if (Grandayy == null) Grandayy = User.GetUserFromId(GrandayyID);

            GrandayyTimeline = Timeline.GetUserTimeline(Grandayy.Id, 10);

            foreach (ITweet t in GrandayyTimeline) {
                if (t.CreatedAt.ToUniversalTime() > DateTime.UtcNow.AddMilliseconds(-UPDATEMS)) {
                    await AnnouncementsChannel.SendMessageAsync("", false, new EmbedBuilder() {
                        Url = t.Url,
                        Description = t.Text,
                        Timestamp = t.CreatedAt.ToUniversalTime(),
                        ThumbnailUrl = Grandayy.ProfileImageUrl400x400,
                        Title = $"{Grandayy.Name} has a message for his disciples",
                        Color = new Color(66, 134, 244)
                    });
                    Log($"{Grandayy.Name} posted {t.Text}");
                    await Audit($"{Grandayy.Name} posted {t.Text}", MsgLevel.Good);
                }
            }

        }
        public async Task YoutubeTick() {
            await AlertVid("Grande1899", "UC9sY9S-ddN-1E0jD2fFWLig");
            await AlertVid("Grandayy", "UCa6TeYZ2DlueFRne5DyAnyg");
        }

        public async Task AlertVid(string channelname, string id) {
            var yt = new YouTubeService(new BaseClientService.Initializer() { ApiKey = "AIzaSyDwUjNlKfjR53fvw6NFuGk_2BOfU9Dq3vQ" });
            var channelsListRequest = yt.Channels.List("contentDetails");
            channelsListRequest.Id = id;
            var channelsListResponse = channelsListRequest.Execute();
            foreach (var channel in channelsListResponse.Items) {
                // of videos uploaded to the authenticated user's channel.
                var uploadsListId = channel.ContentDetails.RelatedPlaylists.Uploads;
                var playlistItemsListRequest = yt.PlaylistItems.List("snippet");
                playlistItemsListRequest.PlaylistId = uploadsListId;
                playlistItemsListRequest.MaxResults = 50;
                // Retrieve the list of videos uploaded to the authenticated user's channel.
                var playlistItemsListResponse = playlistItemsListRequest.Execute();
                foreach (var playlistItem in playlistItemsListResponse.Items) {
                    // Print information about each video.
                    if (playlistItem.Snippet.PublishedAt.Value.ToUniversalTime() > DateTime.UtcNow.AddMilliseconds(-UPDATEMS)) {
                        Log($"New Video By {channelname}, {playlistItem.Snippet.Title}");
                        await Audit($"New video by {channelname}, {playlistItem.Snippet.Title}", MsgLevel.Good);

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

            Log("Avaliable Commands:" + string.Join(", ", commands.Commands.Select(x => x.Name)));

        }
        public async Task HandleCommand(SocketMessage messageParam) {
            // Don't process the command if it was a System Message
            var message = messageParam as SocketUserMessage;
            if (message == null) return;
            // Create a number to track where the prefix ends and the command begins
            int argPos = 0;
            // Determine if the message is a command, based on if it starts with '!' or a mention prefix
            if (!(message.HasCharPrefix(Prefix, ref argPos) || message.HasMentionPrefix(client.CurrentUser, ref argPos))) return;

            if (message.Author.IsBot) return;

            Log($"User {message.Author.Username} Executed {message.Content}");
            await Audit($"User {message.Author.Username} executed {message.Content}", MsgLevel.Good);

            await message.DeleteAsync();

            if (message.Channel.Id != CommandC) {
                await message.Channel.SendMessageAsync(message.Author.Mention, false, new EmbedBuilder() {
                    Title = $"This channel is not meant for using bot commands, please use the following channel",
                    Color = new Color((int) MsgLevel.Error)
                });
                await message.Channel.SendMessageAsync(CommandChannel.Mention);
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

        public static async Task Log(LogMessage m) {
            switch (m.Severity) {
                case LogSeverity.Critical:
                    Log(m, ConsoleColor.DarkRed);
                    await Audit(m, MsgLevel.Error);
                    break;
                case LogSeverity.Debug:
                    Log(m, ConsoleColor.Gray);
                    break;
                case LogSeverity.Error:
                    Log(m, ConsoleColor.Red);
                    await Audit(m, MsgLevel.Error);
                    break;
                case LogSeverity.Info:
                    Log(m, ConsoleColor.White);
                    break;
                case LogSeverity.Verbose:
                    Log(m, ConsoleColor.DarkYellow);
                    await Audit(m, MsgLevel.Warn);
                    break;
                case LogSeverity.Warning:
                    Log(m, ConsoleColor.Yellow);
                    await Audit(m, MsgLevel.Warn);
                    break;
            }
        }
        public static void Log(LogMessage m, ConsoleColor c) => Log($"[{m.Severity}][{m.Source}] {m.Message}{m.Exception}", c);
        public static void Log(object message, ConsoleColor color = ConsoleColor.White, ConsoleColor highlight = ConsoleColor.Black) {
            ConsoleColor priorf = Console.ForegroundColor;
            ConsoleColor priorb = Console.BackgroundColor;

            Console.ForegroundColor = color;
            Console.BackgroundColor = highlight;

            File.WriteAllText("console.log", File.ReadAllText("console.log") + $"\r\n[{DateTime.Now.ToShortDateString()} {DateTime.Now.ToLongTimeString()}]{message}");
            Console.WriteLine($"[{DateTime.Now.ToShortDateString()} {DateTime.Now.ToLongTimeString()}]{message}");

            Console.ForegroundColor = priorf;
            Console.BackgroundColor = priorb;
        }

        public static async void Error(object message) {
            Log($"[Error][Bot] {message}", ConsoleColor.Red);
            await Audit(message, MsgLevel.Warn);
        }
        public static async void Warn(object message) {
            Log($"[Warn][Bot] {message}", ConsoleColor.Yellow);
            await Audit(message, MsgLevel.Error);
        }

        public static async Task Audit(object message, MsgLevel level) {
            await LogChannel.SendMessageAsync("", false, new EmbedBuilder() {
                Title = message.ToString(),
                Timestamp = DateTime.UtcNow,
                Color = new Color((uint) level)
            });
        }

    }
}
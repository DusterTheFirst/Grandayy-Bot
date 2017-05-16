using Discord;
using Discord.WebSocket;
using RobbieBotten.Config;
using RobbieBotten.Util;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using RobbieBotten.Discord.Commands;
using RobbieBotten.SocialMedia;
using Tweetinvi;

namespace RobbieBotten.Discord {
    public class Bot {
        DiscordSocketClient client;

        ConfigFile config;
        private ConfigManager configmanager;

        CommandHandler commandhandler;

        List<Twitter> twitteraccounts = new List<Twitter>();
        List<Youtube> youtubeaccounts = new List<Youtube>();

        public Bot() {
            configmanager = new ConfigManager();

            configmanager.OnFileNotFound += (sender, file) => {
                Logger.Error($"{file} NOT FOUND, CREATING NEW CONFIG");
                Logger.Error($"PLEASE FILL OUT BLANK FIELDS IN {file}");
            };

            config = configmanager.Load();
        }

        public async Task Start() {
            client = new DiscordSocketClient();

            commandhandler = new CommandHandler(config, client);

            await commandhandler.Install();

            client.Log += Logger.Log;
            client.Ready += Ready;
            client.MessageReceived += commandhandler.Handle;

            await client.LoginAsync(TokenType.Bot, config.BotToken);
            await client.StartAsync();

            await Task.Delay(-1);
        }

        public async Task Ready() {
            await client.SetGameAsync($"{config.CommandPrefix}help");

            var SocialMedia = client.GetChannel(config.AnnouncementsChannel) as SocketTextChannel;

            Auth.SetUserCredentials(config.TwitterAPI.ConsumerKey, config.TwitterAPI.ConsumerSecret, config.TwitterAPI.UserAccessToken, config.TwitterAPI.UserAccessSeceret);

            foreach (long p in config.TwitterAccouts) {
                twitteraccounts.Add(new Twitter(config, SocialMedia, p));
            }

            foreach (KeyValuePair<string, string> p in config.YoutubeAccounts) {
                youtubeaccounts.Add(new Youtube(config, SocialMedia, p.Value, p.Key));
            }
        }
    }
}

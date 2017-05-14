using Discord;
using Discord.WebSocket;
using RobbieBotten.Config;
using RobbieBotten.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using Tweetinvi;
using Tweetinvi.Models;
using Tweetinvi.Models.DTO;

namespace RobbieBotten.SocialMedia {
    public class Twitter {

        private ConfigFile config;
        private SocketTextChannel channel;
        private Tweetinvi.Models.IUser user;

        Timer timer;

        public Twitter(ConfigFile config, SocketTextChannel channel, long UUID) {
            this.config = config;
            this.channel = channel;
            user = User.GetUserFromId(UUID);

            Logger.Log($"[Twitter Handler:{user.ScreenName}] Started Twitter checker");

            timer = new Timer(Update, null, 0, config.SocialTick);
        }

        public void Update(object StateInfo) {
            var tweets = Timeline.GetUserTimeline(user, 5);
            tweets = tweets.Where(t => t.CreatedAt > DateTime.Now.AddMilliseconds(-config.SocialTick)).Reverse();

            foreach(ITweet tweet in tweets) {
                IExtendedTweet extweet = tweet.ExtendedTweet;

                var replaced = Regex.Replace(tweet.Text, "@([A-Za-z]+[A-Za-z0-9]+)", m =>
                    $"[{m.Value}](https://twitter.com/{m.Value.Replace("@", "")})");

                replaced = Regex.Replace(replaced, "#([A-Za-z]+[A-Za-z0-9]+)", m =>
                    $"[{m.Value}](https://twitter.com/hashtag/{m.Value.Replace("#", "")})");

                Logger.Log($"[Twitter Handler:{user.ScreenName}] New Tweet, {tweet.Text}");

                channel.SendMessageAsync("", false, new EmbedBuilder() {
                    Color = new Color(43, 149, 255),
                    ThumbnailUrl = tweet.CreatedBy.ProfileImageUrl400x400,
                    ImageUrl = tweet.Entities.Medias.FirstOrDefault()?.MediaURL,
                    Url = tweet.Url,
                    Description = replaced,
                    Title = $"{tweet.CreatedBy.ScreenName} has a message for his desciples",
                    Footer = new EmbedFooterBuilder() {
                        Text = "Twooter™",
                        IconUrl = "https://twitter.com/favicon.ico"
                    },
                    Timestamp = tweet.CreatedAt.ToUniversalTime()
                });
            }
        }

    }
}

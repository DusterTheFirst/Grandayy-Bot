using Discord;
using Discord.WebSocket;
using RobbieBotten.Config;
using RobbieBotten.Util;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using Tweetinvi;
using Tweetinvi.Models;
using Tweetinvi.Models.DTO;
using Tweetinvi.Parameters;

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

            if (!File.Exists($"{user.IdStr}.tweet")) {
                File.Create($"{user.IdStr}.tweet").Close();
            }

            Logger.Log($"[Twitter Handler:{user.ScreenName}] Started Twitter checker");

            timer = new Timer(Update, null, 0, config.SocialTick);
        }

        public void Update(object StateInfo) {
            try {
                var perameters = new UserTimelineParameters {
                    MaximumNumberOfTweetsToRetrieve = 5,
                };
                if (File.ReadAllText($"{user.IdStr}.tweet") != "")
                    perameters.SinceId = long.Parse(File.ReadAllText($"{user.IdStr}.tweet"));

                IEnumerable<ITweet> tweets = Timeline.GetUserTimeline(user, perameters).OrderBy(x => x.Id);

                if (tweets.Count() == 0)
                    return;

                File.WriteAllText($"{user.IdStr}.tweet", tweets.Reverse().First().IdStr);

                foreach (ITweet tweet in tweets) {
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
            } catch (Exception e) {
                Logger.Error(e);
            }
        }

    }
}

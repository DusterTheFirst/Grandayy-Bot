using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Config {
    public class ConfigFile {
        [JsonProperty("bot_token")]
        public string BotToken { get; set; }
        [JsonProperty("command_prefix")]
        public char CommandPrefix { get; set; }

        [JsonProperty("server_id")]
        public ulong ServerID { get; set; }

        [JsonProperty("dm_whitelist")]
        public List<ulong> DMWhitlist { get; set; }

        [JsonProperty("channel_ids")]
        public SpecialChannels Channels { get; set; }
        
        [JsonProperty("twitter_account")]
        public long TwitterAccout { get; set; }
        [JsonProperty("youtube_accounts")]
        public Dictionary<string, string> YoutubeAccounts { get; set; }

        [JsonProperty("media_refresh")]
        public uint SocialTick { get; set; }

        [JsonProperty("twitter_api")]
        public TwitterAPI TwitterAPI { get; set; }
        [JsonProperty("youtube_api")]
        public YoutubeAPI YoutubeAPI { get; set; }

        public ConfigFile() {
            BotToken = "";
            CommandPrefix = '>';

            ServerID = 0;

            DMWhitlist = new List<ulong>();

            Channels = new SpecialChannels();

            TwitterAccout = 0;
            YoutubeAccounts = new Dictionary<string, string>();

            SocialTick = 15000;

            TwitterAPI = new TwitterAPI();
            YoutubeAPI = new YoutubeAPI();
        }
    }

    public class SpecialChannels {
        [JsonProperty("announcements")]
        public ulong AnnouncementsChannel { get; set; }
        [JsonProperty("commands")]
        public ulong CommandChannel { get; set; }
    }

    public class TwitterAPI {
        [JsonProperty("consumer_key")]
        public string ConsumerKey { get; set; }
        [JsonProperty("consumer_secret")]
        public string ConsumerSecret { get; set; }
        [JsonProperty("user_access_token")]
        public string UserAccessToken { get; set; }
        [JsonProperty("user_access_secret")]
        public string UserAccessSeceret { get; set; }

        public TwitterAPI() {
            ConsumerKey = "";
            ConsumerSecret = "";
            UserAccessToken = "";
            UserAccessSeceret = "";
        }
    }

    public class YoutubeAPI {
        [JsonProperty("key")]
        public string APIKey { get; set; }

        public YoutubeAPI() {
            APIKey = "";
        }
    }
}

using Discord.WebSocket;
using RobbieBotten.Config;
using RobbieBotten.Util;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Upload;
using Google.Apis.Util.Store;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;
using System.Threading.Tasks;
using System.Linq;
using Discord;
using System.IO;

namespace RobbieBotten.SocialMedia {
    public class Youtube {
        private ConfigFile config;
        private SocketTextChannel channel;
        private string UUID;
        private string name;
        private YouTubeService youtubeService;

        Timer timer;

        public Youtube(ConfigFile config, SocketTextChannel channel, string UUID, string name) {
            this.config = config;
            this.channel = channel;
            this.UUID = UUID;
            this.name = name;
            youtubeService = new YouTubeService(new BaseClientService.Initializer() {
                ApiKey = config.YoutubeAPI.APIKey,
                ApplicationName = GetType().ToString()
            });

            if (!File.Exists($"{UUID}.video")) {
                File.Create($"{UUID}.video").Close();
            }

            Logger.Log($"[Youtube Handler:{name}] Started Youtube checker");

            timer = new Timer(Update, null, 0, config.SocialTick);
        }

        public async void Update(object StateInfo) {
            try {

                string SinceID = "";

                if (File.ReadAllText($"{UUID}.video") != "")
                    SinceID = File.ReadAllText($"{UUID}.video");

                var channelsListRequest = youtubeService.Channels.List("contentDetails");
                channelsListRequest.Id = UUID;

                var channelsListResponse = await channelsListRequest.ExecuteAsync();

                foreach (var ytchannel in channelsListResponse.Items) {
                    var uploadsListId = ytchannel.ContentDetails.RelatedPlaylists.Uploads;
                    var playlistItemsListRequest = youtubeService.PlaylistItems.List("snippet");
                    playlistItemsListRequest.PlaylistId = uploadsListId;
                    playlistItemsListRequest.MaxResults = 5;
                    playlistItemsListRequest.PageToken = "";

                    var playlistItemsListResponse = await playlistItemsListRequest.ExecuteAsync();

                    //var worked = DateTime.TryParse(SinceID, out DateTime last);

                    //if (worked) 

                    int playlistIndex;
                    if (SinceID != "")
                        if (playlistItemsListResponse.Items.Select(t => t.Snippet.ResourceId.VideoId).Contains(SinceID)) {
                            playlistIndex = playlistItemsListResponse.Items.IndexOf(playlistItemsListResponse.Items.First(t => t.Snippet.ResourceId.VideoId == SinceID));
                        } else {
                            playlistIndex = 100;
                        } 
                    else
                        playlistIndex = 100;

                    Logger.Error(playlistIndex);

                    var playlistItems = playlistItemsListResponse.Items.Where(x => playlistItemsListResponse.Items.IndexOf(x) > playlistIndex);

                    //Logger.Log(string.Join(",\n", playlistItemsListResponse.Items.Select(x => $"{x.Snippet.Title}|{x.Snippet.PublishedAt}")));

                    foreach (var playlistItem in playlistItems) {
                        Logger.Log($"[Youtube Handler:{name}] New Video, {playlistItem.Snippet.Title}");

                        await channel.SendMessageAsync($"@everyone, {name} has a new piece of art to share with you mortals\n\nhttps://www.youtube.com/watch?v={playlistItem.Snippet.ResourceId.VideoId}");
                    }

                    File.WriteAllText($"{UUID}.video", playlistItems.Reverse().First().Snippet.ResourceId.VideoId);
                }
            } catch (Exception e) {
                Logger.Error(e);
            }
        }
    }
}

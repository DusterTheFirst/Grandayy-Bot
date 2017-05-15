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

            Logger.Log($"[Youtube Handler:{name}] Started Youtube checker");

            timer = new Timer(Update, null, 0, config.SocialTick);
        }

        public async void Update(object StateInfo) {
            var channelsListRequest = youtubeService.Channels.List("contentDetails");
            channelsListRequest.Id = UUID;

            var channelsListResponse = await channelsListRequest.ExecuteAsync();

            foreach (var ytchannel in channelsListResponse.Items) {
                var uploadsListId = ytchannel.ContentDetails.RelatedPlaylists.Uploads;
                var playlistItemsListRequest = youtubeService.PlaylistItems.List("snippet");
                playlistItemsListRequest.PlaylistId = uploadsListId;
                playlistItemsListRequest.MaxResults = 3;
                playlistItemsListRequest.PageToken = "";

                var playlistItemsListResponse = await playlistItemsListRequest.ExecuteAsync();

                var playlistItems = playlistItemsListResponse.Items.Where(t => t.Snippet.PublishedAt > DateTime.Now.AddMilliseconds(-config.SocialTick)).Reverse();

                //Logger.Log(string.Join(",\n", playlistItemsListResponse.Items.Select(x => $"{x.Snippet.Title}|{x.Snippet.PublishedAt}")));

                foreach (var playlistItem in playlistItems) {
                    Logger.Log($"[Youtube Handler:{name}] New Video, {playlistItem.Snippet.Title}");

                    await channel.SendMessageAsync($"@everyone, {name} has a new piece of art to share with you mortals\n\nhttps://www.youtube.com/watch?v={playlistItem.Snippet.ResourceId.VideoId}");
                }
            }
        }
    }
}

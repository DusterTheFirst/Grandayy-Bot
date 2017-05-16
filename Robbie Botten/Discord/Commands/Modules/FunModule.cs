using Discord;
using Discord.Commands;
using Discord.WebSocket;
using ImageSharp;
using ImageSharp.Drawing;
using RobbieBotten.Config;
using RobbieBotten.Util;
using RobbieBotten.Util.Extentions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Discord.Commands.Modules {
    [Summary("Fun Commands")]
    public class FunModule : ModuleBase {
        [Command("fight", RunMode = RunMode.Async), Alias("f"), Summary("Make the given person fight you to the death")]
        public async Task Fight(string opponent) {
            if (opponent == null) {
                await Context.Message.DeleteAsync();
                await Context.Channel.SendMessage("Please input a user's mention as the perameter", MsgLevel.Warn);
                return;
            }
            await Fight(Context.User.Username, opponent);
        }

        [Command("fight", RunMode = RunMode.Async), Alias("f"), Summary("Make the given people fight to the death")]
        public async Task Fight(string player1 = null, string player2 = null) {
            if (player1 == null || player2 == null) {
                await Context.Message.DeleteAsync();
                await Context.Channel.SendMessage("Missing one or more users", MsgLevel.Warn);
                return;
            }

            await Context.Message.DeleteAsync();
            Random rnd = new Random();

            List<string> lines = File.ReadAllLines("res/fightresp.txt").ToList();

            int response = rnd.Next(1, lines.Count);
            int winner = rnd.Next(0, 100);

            string line = lines[response - 1];

            switch (winner % 2) {
                case 0:
                    line = line.Replace("{winner}", $"**{player1}**").Replace("{loser}", $"**{player2}**");
                    //Logger.Log(player1);
                    break;
                case 1:
                    line = line.Replace("{winner}", $"**{player2}**").Replace("{loser}", $"**{player1}**");
                    //Logger.Log(player2);
                    break;
            }

            await Context.Channel.SendMessageAsync(line);

        }

        [Command("carrotzy", RunMode = RunMode.Async), Alias("carrot", "c"), Summary("Carrotzyify the attached image")]
        public async Task Carrotzy() {
            var attachments = Context.Message.Attachments;

            if (attachments.Count() == 0) {
                await Context.Channel.SendMessage("Please Attach A File", MsgLevel.Warn);
                return;
            }

            var filteredattachments = attachments.Where(a => {

                var filename = a.Filename.Split(".");
                string extention = filename[filename.Length - 1].ToLower();

                return extention == "bmp"
                    || extention == "gif"
                    || extention == "jpeg"
                    || extention == "jpg"
                    || extention == "exif"
                    || extention == "png"
                    || extention == "tiff";
            });

            if (filteredattachments.Count() == 0) {
                await Context.Channel.SendMessage("That is not an image file", MsgLevel.Warn);
                return;
            }

            foreach (IAttachment attachment in filteredattachments) {
                await Carrotzy(attachment.Url);
            }

        }

        [Command("carrotzy", RunMode = RunMode.Async), Alias("carrot", "c"), Summary("Carrotzyify the image from the url")]
        public async Task Carrotzy(string url) {
            WebResponse file = Web.GetStreamFromUrl(url);
            
            Stream output = new MemoryStream();
            Stream imagestream = file.GetResponseStream();

            WebClient Client = new WebClient();
            Client.DownloadFile(url, "temp.png");

            using (Image<Rgba32> image = ImageSharp.Image.Load("temp.png")) {
                image.Pixelate(image.Height / 40)
                     .Save("temp.png");
            }

            await Context.Channel.SendFileAsync("temp.png");

            output.Dispose();
            imagestream.Dispose();
            file.Dispose();
        }
    }
}

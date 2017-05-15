using Discord;
using Discord.Commands;
using Discord.WebSocket;
using ImageSharp;
using RobbieBotten.Config;
using RobbieBotten.Util;
using RobbieBotten.Util.Extentions;
using SixLabors.Fonts;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Discord.Commands.Modules {
    public class PrefixedModule : ModuleBase {
        public ConfigFile Config { get; set; }

        [Command("memes", RunMode = RunMode.Async), Alias("m"), Summary("Get Grandayys memes playlist")]
        public async Task Memes() {
            await Context.Message.DeleteAsync();
            await Context.Channel.SendMessageAsync("https://www.youtube.com/playlist?list=PLd7iEW-IcEboD2dabxaPY2TXKGtkCqyyL");
        }

        [Command("nsfw", RunMode = RunMode.Async), Summary("Give yourself or others access to the NSFW channel")]
        public async Task NSFW() {
            await Context.Message.DeleteAsync();
            SocketGuildUser sender = (Context.User as SocketGuildUser);
            SocketGuildUser changinguser = Context.User as SocketGuildUser;

            IEnumerable<SocketRole> roles = changinguser.Roles;
            IEnumerable<SocketRole> groles = Context.Guild.Roles.Cast<SocketRole>();
            SocketRole NSFW;

            try {
                NSFW = groles.First(x => x.Name == "nsfw-access");
            } catch {
                await Context.Channel.SendMessage("There is no 'nsfw-acess' role avaliable", MsgLevel.Error);
                return;
            }

            if (roles.Contains(NSFW)) {
                await changinguser.RemoveRoleAsync(NSFW);

                await Context.Channel.SendMessage($"{changinguser.Username} has been banished from the NSFW realm", MsgLevel.Warn);
            } else {
                await changinguser.AddRoleAsync(NSFW);

                await Context.Channel.SendMessage($"{changinguser.Username} can now enter the NSFW realm", MsgLevel.Good);
            }
        }

        [Command("fight", RunMode = RunMode.Async), Alias("f"), Summary("Make the given person fight you to the death")]
        public async Task Fight(IUser opponent) {
            await Fight(Context.User, opponent);
        }

        [Command("fight", RunMode = RunMode.Async), Alias("f"), Summary("Make the given people fight to the death")]
        public async Task Fight(IUser player1, IUser player2) {
            await Context.Channel.SendMessageAsync("NOT IMPLEMENTED");
        }

        [Command("1k", RunMode = RunMode.Async), Alias("1000"), Summary("Become an Early Memer")]
        public async Task OneK() {
            await Context.Message.DeleteAsync();
            if (!Config.OneK) {
                await Context.Channel.SendMessage("Not yet ;)", MsgLevel.Warn);
                return;
            }

            SocketGuildUser sender = (Context.User as SocketGuildUser);
            SocketGuildUser changinguser = Context.User as SocketGuildUser;

            IEnumerable<SocketRole> roles = changinguser.Roles;
            IEnumerable<SocketRole> groles = Context.Guild.Roles.Cast<SocketRole>();
            SocketRole EM;

            try {
                EM = groles.First(x => x.Name == "Early Memer");
            } catch {
                await Context.Channel.SendMessage("There is no 'Early Memer' role avaliable", MsgLevel.Error);
                return;
            }

            if (roles.Contains(EM)) {
                await Context.Channel.SendMessage($"{changinguser.Username} already is an Early Memer", MsgLevel.Warn);
            } else {
                await changinguser.AddRoleAsync(EM);

                await Context.Channel.SendMessage($"{changinguser.Username} has become an Early Memer", MsgLevel.Good);
            }
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
                Logger.Log(file.ContentLength);
                Logger.Log(file.ContentType);
                Logger.Log(file.ResponseUri);
                Logger.Log(new StreamReader(file.GetResponseStream()).ReadToEnd());
                image.Pixelate(image.Height / 40).Save("temp.png");
            }

            await Context.Channel.SendFileAsync("temp.png");

            output.Dispose();
            imagestream.Dispose();
            file.Dispose();
        }
    }
}

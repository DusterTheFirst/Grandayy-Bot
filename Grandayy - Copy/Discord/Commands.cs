using Discord;
using Discord.Commands;
using Discord.WebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Grandayy.Discord {
    class CommandModule : ModuleBase {
        
        [Command("nsfw"), Alias("nfsw"), Summary("Give yourself or others access to the NSFW channel")]
        public async Task NSFW(IUser user = null) {
            SocketGuildUser sender = (Context.User as SocketGuildUser);
            SocketGuildUser changinguser = (user ?? Context.User) as SocketGuildUser;

            if (user != null) {
                if (!sender.GuildPermissions.ManageRoles) {
                    await SendMessage(Context.Channel, $"{sender.Username} does not have the manage roles permission", MsgLevel.Error);
                    return;
                }
            }

            IEnumerable<SocketRole> roles = changinguser.Roles;
            IEnumerable<SocketRole> groles = Context.Guild.Roles.Cast<SocketRole>();
            SocketRole NSFW;

            try {
                NSFW = groles.First(x => x.Name == "nsfw-access");
            } catch {
                await SendMessage(Context.Channel, "There is no 'nsfw-acess' role avaliable", MsgLevel.Error);
                return;
            }

            if (roles.Contains(NSFW)) {
                await changinguser.RemoveRoleAsync(NSFW);

                await SendMessage(Context.Channel, $"{changinguser.Username} has been banished from the NSFW realm", MsgLevel.Warn);
            } else {
                await changinguser.AddRoleAsync(NSFW);

                await SendMessage(Context.Channel, $"{changinguser.Username} can now enter the NSFW realm", MsgLevel.Good);
            }
        }

        [Command("feedback"), Alias("f"), Summary("Get link to the feedback form")]
        public async Task Feedback() {
            await Context.Channel.SendMessageAsync("https://goo.gl/forms/hzmuOE9PsE9Dh1ax1");
        }

        /// <summary>
        /// All Commands
        /// </summary>
        /// <returns></returns>
        [Command("help", RunMode = RunMode.Async), Alias("?"), Summary("List all commands availible to you")]
        public async Task HelpAsync() {
            //  Prefix
            string prefix = Program.Prefix.ToString();

            //  Embed
            var builder = new EmbedBuilder() {
                Title = $"Commands availible to {Context.Message.Author.Username}",
                Description = "\n",
                Color = new Color((int) MsgLevel.Good),
                Timestamp = DateTimeOffset.UtcNow
            };

            //  Loops Through Modules
            foreach (var module in Program.commands.Modules) {
                //  Creates Description
                string description = null;
                foreach (var cmd in module.Commands) {
                    var result = await cmd.CheckPreconditionsAsync(Context);
                    if (result.IsSuccess)
                        description += $"{prefix}{cmd.Aliases.First()} {string.Join(" ", cmd.Parameters.Select(p => $"[{p.Name}]"))} - *{cmd.Summary}*\n";
                }

                //  Adds Field To Embed
                if (!string.IsNullOrWhiteSpace(description)) {
                    builder.Description += description;
                }
            }

            //  Send
            await ReplyAsync("", false, builder.Build());
        }

        /// <summary>
        /// Search Fof Help On The Given Command
        /// </summary>
        /// <param name="command">Command To Search For</param>
        /// <returns></returns>
        [Command("help", RunMode = RunMode.Async), Alias("?"), Summary("Search for help on a command"), Priority(-1)]
        public async Task HelpAsync([Remainder] string command) {

            //  Search For Command
            var result = Program.commands.Search(Context, command);

            //  Creates Embed
            var builder = new EmbedBuilder() {
                Title = $"Results for {command}",
                Color = new Color((int) MsgLevel.Good),
                Timestamp = DateTimeOffset.UtcNow
            };

            //  Checks If Command Was Found
            if (!result.IsSuccess) {
                builder.Color = new Color((int) MsgLevel.Error);
                builder.Title = $"Command **{command}**, not found";
                builder.Description = $"*Type {Program.Prefix.ToString()}help for all commands*";
            } else {
                //  Adds Field For Each Command Found
                foreach (var match in result.Commands) {
                    var cmd = match.Command;

                    builder.AddField(x => {
                        x.Name = cmd.Aliases.First();
                        x.Value = $"*Aliases*: {string.Join(", ", cmd.Aliases.Skip(1))}\n" +
                                  $"*Parameters*: {string.Join(", ", cmd.Parameters.Select(p => p.Name))}\n" +
                                  $"*Summary*: {cmd.Summary}";
                        x.IsInline = false;
                    });
                }
            }

            //  Send Message
            await ReplyAsync("", false, builder.Build());
        }

        public async Task SendMessage(IMessageChannel channel, string message, MsgLevel level) {
            await channel.SendMessageAsync("", false, new EmbedBuilder() {
                Title = message,
                Color = new Color((uint) level)
            });
        }
    }

}

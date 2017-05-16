using Discord.Commands;
using Discord.WebSocket;
using RobbieBotten.Config;
using RobbieBotten.Util.Extentions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Discord.Commands.Modules {
    [Summary("Role Commands")]
    public class RoleModule : ModuleBase {
        public ConfigFile Config { get; set; }

        [Command("1k", RunMode = RunMode.Async), Alias("1000"), Summary(";)")]
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
    }
}

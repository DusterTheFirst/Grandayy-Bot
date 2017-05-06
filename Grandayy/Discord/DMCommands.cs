using Discord;
using Discord.Commands;
using Discord.WebSocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Grandayy.Discord {
    class DMModule : CommandModule {

        [Command("in", RunMode = RunMode.Async)]
        public async Task In(string ch, string action, [Remainder] string todo = "") {
            var Guild = await Context.Client.GetGuildAsync(Program.Config.ServerID);
            var Channels = await Guild.GetChannelsAsync();
            var IChannel = Channels.Where(x => x is SocketTextChannel).First(x => x.Name.ToLower() == ch.ToLower());
            var Channel = IChannel as SocketTextChannel;

            if (Channel == null) {
                await Context.Channel.SendMessageAsync($"Channel {ch} Not Found");
                return;
            }

            await Context.Channel.SendMessageAsync($"In {Channel.Name}, I Will {action} {todo}");

            switch (action.ToLower()) {
                case "upload":
                case "post":
                case "image":
                    switch (todo.ToLower()) {
                        case "know":
                            await Channel.SendFileAsync("res/TMYK.jpg", "");
                            break;
                        case "swear":
                            await Channel.SendFileAsync("res/swear.png", "");
                            break;
                    }
                    break;
                case "say":
                    await Channel.SendMessageAsync(todo);
                    break;
                default:
                    await Context.Channel.SendMessageAsync($"Unknown Action: {action}");
                    break;
            }
        }

    }
}

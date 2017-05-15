using Discord;
using RobbieBotten.Discord;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Util.Extentions {
    public static class DiscordExtentions {
        public static async Task SendMessage(this IMessageChannel channel, string message, MsgLevel level) {
            await channel.SendMessageAsync("", false, new EmbedBuilder() {
                Title = message,
                Color = new Color((uint) level)
            });
        }
    }
}

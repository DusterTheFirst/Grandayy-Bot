using Discord;
using Discord.Commands;
using Discord.WebSocket;
using RobbieBotten.Config;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Discord.Commands.Modules {
    public class HelpModule : ModuleBase {
        public ConfigFile Config { get; set; }
        public CommandService Service { get; set; }

        /// <summary>
        /// All Commands
        /// </summary>
        /// <returns></returns>
        [Command("help", RunMode = RunMode.Async), Alias("?"), Summary("List all commands availible to you")]
        public async Task HelpAsync() {
            await Context.Message.DeleteAsync();
            //  Prefix
            string prefix = Context.Message.Content.First() == Config.CommandPrefix ? Config.CommandPrefix.ToString() : "";

            //  Embed
            var builder = new EmbedBuilder() {
                Title = $"Commands available to {Context.Message.Author.Username}",
                Description = "\n",
                Color = new Color((int) MsgLevel.Good),
                Timestamp = DateTimeOffset.UtcNow
            };

            //  Loops Through Modules
            foreach (var module in Service.Modules) {
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
            await Context.Message.DeleteAsync();

            //  Search For Command
            var result = Service.Search(Context, command);

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
                builder.Description = $"*Type {(Context.Message.Content.First() == Config.CommandPrefix ? Config.CommandPrefix.ToString() : "")}help for all commands*";
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
    }
}

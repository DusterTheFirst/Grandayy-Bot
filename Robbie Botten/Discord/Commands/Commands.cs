using Discord.WebSocket;
using Discord.Commands;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using RobbieBotten.Config;
using RobbieBotten.Discord.Commands.Modules;
using Microsoft.Extensions.DependencyInjection;
using Discord;
using RobbieBotten.Util;
using System.Linq;

namespace RobbieBotten.Discord.Commands {
    public class Commands {
        public ConfigFile config;
        private DiscordSocketClient client;

        private CommandService DMCommands;
        private CommandService PrefixedCommands;
        private CommandService NonprefixedCommands;

        public Commands(ConfigFile config, DiscordSocketClient client) {
            this.config = config;
            this.client = client;

            DMCommands = new CommandService();
            PrefixedCommands = new CommandService();
            NonprefixedCommands = new CommandService();
        }

        public async Task Install() {
            await DMCommands.AddModuleAsync<HelpModule>();

            await PrefixedCommands.AddModuleAsync<HelpModule>();

            await NonprefixedCommands.AddModuleAsync<HelpModule>();
        }

        public async Task Handle(SocketMessage m) {
            var argPos = 0;

            var message = m as SocketUserMessage;
            if (message == null) return;

            if (message.Author.IsBot) return;

            var context = new CommandContext(client, message);

            if (message.Channel is IDMChannel) {
                await HandleDM(context, argPos);
                return;
            }

            if (message.Content.Trim().Equals(client.CurrentUser.Mention)) {
                await message.Channel.SendMessageAsync("TF you want with me?");
                return;
            }

            if (message.HasCharPrefix(config.CommandPrefix, ref argPos)) {
                await HandlePrefixed(context, argPos);
                return;
            }

            await NonprefixedMention(context, argPos);

        }

        public async Task HandleDM(CommandContext context, int argPos) {
            Logger.Log($"Commands avaliable: {string.Join(", ", DMCommands.Modules.Select(x => string.Join(", ", x.Commands.Select(c => c.Name))))}");

            var services = new ServiceCollection()
                .AddSingleton(config)
                .AddSingleton(DMCommands);

            var provider = new DefaultServiceProviderFactory().CreateServiceProvider(services);

            var result = await DMCommands.ExecuteAsync(context, argPos, provider);

            if (!result.IsSuccess) {
                await context.Channel.SendMessageAsync(result.ErrorReason);
                Logger.Warn($"[DM Command Handler] {context.Message.Author} messaged you '{context.Message.Content}'");
            } else {
                Logger.Log($"[DM Command Handler] {context.Message.Author} executed '{context.Message.Content}'");
            }
        }

        public async Task HandlePrefixed(CommandContext context, int argPos) {
            Logger.Log($"Commands avaliable: {string.Join(", ", PrefixedCommands.Modules.Select(x => string.Join(", ", x.Commands.Select(c => c.Name))))}");

            var services = new ServiceCollection()
                .AddSingleton(config)
                .AddSingleton(PrefixedCommands);

            var provider = new DefaultServiceProviderFactory().CreateServiceProvider(services);

            var result = await DMCommands.ExecuteAsync(context, argPos, provider);

            if (!result.IsSuccess) {
                await context.Channel.SendMessageAsync(result.ErrorReason);
                Logger.Warn($"[Prefixed Command Handler] {context.Message.Author} failed to execute '{context.Message.Content}'");
            } else {
                await context.Message.DeleteAsync();
                Logger.Log($"[Prefixed Command Handler] {context.Message.Author} executed '{context.Message.Content}'");
            }
        }

        public async Task NonprefixedMention(CommandContext context, int argPos) {
            if (LevenshteinDistance.Compute(context.Message.Content.Split("<")[0], "did you know you can apply for discord partner") < 10) {
                await context.Channel.SendMessageAsync("No, how so");
            }
        }

    }
}

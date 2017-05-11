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

namespace RobbieBotten.Discord.Commands {
    public class Commands {
        public ConfigFile config;
        private DiscordSocketClient client;

        private CommandService DMCommands;
        private CommandService PrefixedCommands;
        private CommandService MentionedCommands;

        public Commands(ConfigFile config, DiscordSocketClient client) {
            this.config = config;
            this.client = client;
        }

        public async Task Install() {
            await DMCommands.AddModuleAsync<HelpModule>();

            await PrefixedCommands.AddModuleAsync<HelpModule>();

            await MentionedCommands.AddModuleAsync<HelpModule>();
        }

        public async Task Handle(SocketMessage m) {

            var argPos = 0;

            var message = m as SocketUserMessage;
            if (message == null) return;

            var context = new CommandContext(client, message);

            if (message.Channel is IDMChannel) {
                await HandleDM(context);
            } else {
                if (message.HasCharPrefix(config.CommandPrefix, ref argPos)) {
                    await HandlePrefixed(context);
                } else if (message.HasMentionPrefix(client.CurrentUser, ref argPos)) {
                    await HandleMention(context);
                }
            }
        }

        public async Task HandleDM(CommandContext context) {
            var services = new ServiceCollection()
                .AddSingleton(config)
                .AddSingleton(DMCommands);

            var provider = new DefaultServiceProviderFactory().CreateServiceProvider(services);

            var result = await DMCommands.ExecuteAsync(context, 0, provider);

            if (!result.IsSuccess) {
                await context.Channel.SendMessageAsync(result.ErrorReason);
            } else {
                await context.Message.DeleteAsync();
            }
        }

        public async Task HandlePrefixed(CommandContext context) {
            var services = new ServiceCollection()
                .AddSingleton(config)
                .AddSingleton(PrefixedCommands);

            var provider = new DefaultServiceProviderFactory().CreateServiceProvider(services);

            var result = await DMCommands.ExecuteAsync(context, 0, provider);

            if (!result.IsSuccess) {
                await context.Channel.SendMessageAsync(result.ErrorReason);
            } else {
                await context.Message.DeleteAsync();
            }
        }

        public async Task HandleMention(CommandContext context) {
            var services = new ServiceCollection()
                .AddSingleton(config)
                .AddSingleton(MentionedCommands);

            var provider = new DefaultServiceProviderFactory().CreateServiceProvider(services);

            var result = await DMCommands.ExecuteAsync(context, 0, provider);

            if (!result.IsSuccess) {
                await context.Channel.SendMessageAsync(result.ErrorReason);
            } else {
                await context.Message.DeleteAsync();
            }
        }

    }
}

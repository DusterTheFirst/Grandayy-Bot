import { CommandHandler } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite3";

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createNestedCommand('subscribe to events')
        .setDescription('Subscribe to events')
        .setCategory('Subscriptions')
        .hide()
        .setCallback((context) => {
            try {
                var role = context.guild.roles.find(x => x.name === 'Event Participant');
                if (context.message.member.roles.some(x => x.name === 'Event Participant')) {
                    context.message.reply("You already are subscribed");
                } else {
                    context.message.member.addRole(role);
                    context.message.reply("You have been subscribed to `Events`!");
                }
            } catch (e) {
                context.channel.send("***INTERNAL ERROR, PLEASE TRY AGAIN***");
            }
        });

    handler.createNestedCommand('unsubscribe from events')
        .setDescription('Unsubscribe from events')
        .setCategory('Unsubscriptions')
        .hide()
        .setCallback((context) => {
            try {
                var role = context.guild.roles.find(x => x.name === 'Event Participant');
                if (context.message.member.roles.some(x => x.name === 'Event Participant')) {
                    context.message.member.removeRole(role);
                    context.message.reply("You have been unsubscribed from `Events`!");
                } else {
                    context.message.reply("You already are unsubscribed");
                }
            } catch (e) {
                context.channel.send("***INTERNAL ERROR, PLEASE TRY AGAIN***");
            }
        });
};
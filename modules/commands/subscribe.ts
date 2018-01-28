import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client, RichEmbed } from "discord.js";
import { Database } from "sqlite";

interface Subscription {
    name: string;
    description: string;
    role: string;
}

const subscriptions: Subscription[] = require("./res/subscriptions.json");

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createNestedCommand("subscriptions all")
        .setDescription("List all possible subscriptions")
        .setCategory("Subscription Commands")
        .setCallback((context) => {
            let embed = new RichEmbed()
                                .setColor(config.colors.green);

            for (let sub of subscriptions) {
                embed.addField(sub.name, sub.description);
            }

            context.channel.send(embed);
        });

    handler.createNestedCommand("subscriptions mine")
        .setDescription("List all subscriptions you have")
        .setCategory("Subscription Commands")
        .setCallback((context) => {
            let myRoles = context.member.roles.map(x => x.name);

            let mySubs: Subscription[] = [];
            let allSubs = Object.values(subscriptions);

            for (let role of myRoles) {
                let found = allSubs.find(x => x.role === role);
                if (!found) continue;

                mySubs.push(found);
            }

            if (mySubs.length === 0) {
                context.channel.send("You are not subscribed to anything");
                return;
            }

            let subText: string = "";
            for (let sub of mySubs) {
                subText += `** - ${sub.name}**\n`;
            }
            context.channel.send(`You are subscribed to:\n${subText}`);
        });

    handler.createNestedCommand("subscribe to")
        .addParameter("keyword", ParameterType.Required)
        .setDescription("Subscribe to some channels")
        .setCategory("Subscription Commands")
        .setCallback((context) => {
            let keyword: string = context.params.get("keyword").toLowerCase();
            let sub = subscriptions.find(x => x.name === keyword);

            if (!sub) {
                context.channel.send(`Keyword "**${keyword}**" does not exist`);
                return;
            }

            let role = context.guild.roles.find(x => x.name === sub.role);

            if (!role) {
                context.channel.send(`I cannot find the role for **${keyword}**`);
                return;
            }

            if (context.message.member.roles.has(role.id)) {
                context.message.reply(`You already are subscribed to ${keyword}`);
            } else {
                context.message.member.addRole(role).catch(e => console.error(e));
                context.message.reply(`You have been subscribed to **${keyword}**!`);
            }
        });

    handler.createNestedCommand("unsubscribe from")
        .addParameter("keyword", ParameterType.Required)
        .setDescription("Unsubscribe from some channels")
        .setCategory("Subscription Commands")
        .setCallback((context) => {
            let keyword: string = context.params.get("keyword").toLowerCase();
            let sub = subscriptions.find(x => x.name === keyword);

            if (!sub) {
                context.channel.send(`Keyword "**${keyword}**" does not exist`);
                return;
            }

            let role = context.guild.roles.find(x => x.name === sub.role);
            if (!role) {
                context.channel.send(`I cannot find the role for  **${keyword}**`);
                return;
            }

            if (context.message.member.roles.has(role.id)) {
                context.message.member.removeRole(role).catch(e => console.error(e));
                context.message.reply(`You have been unsubscribed from **${keyword}**!`);
            } else {
                context.message.reply(`You already are unubscribed from ${keyword}`);

            }
        });
};
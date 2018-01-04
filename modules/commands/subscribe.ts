import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client, RichEmbed } from "discord.js";
import { Database } from "sqlite3";

interface Subscription { 
    name: string;
    description: string;
    role: string;
}

const subscriptions: Subscription[] = require("./res/subscriptions.json");

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createNestedCommand("subscriptions list all")
        .setDescription("List all possible subscriptions")
        .setCategory("Subscription Commands")
        .setCallback((context) => {
            let embed = new RichEmbed()
                                .setColor("#43b581");

            for (let sub of subscriptions) {
                embed.addField(sub.name, sub.description);
            }

            context.channel.send(embed);
        });

    handler.createNestedCommand("subscriptions list mine")
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
            let roleName = subscriptions.find(x => x.name === keyword);

            if (!roleName) {
                context.channel.send(`Keyword "**${keyword}**" does not exist`);
            }
            // try {
            //     var role = context.guild.roles.find(x => x.name === "Event Participant");
            //     if (context.message.member.roles.some(x => x.name === "Event Participant")) {
            //         context.message.reply("You already are subscribed");
            //     } else {
            //         context.message.member.addRole(role);
            //         context.message.reply("You have been subscribed to `Events`!");
            //     }
            // } catch (e) {
            //     context.channel.send("***INTERNAL ERROR, PLEASE TRY AGAIN***");
            // }
        });

    handler.createNestedCommand("unsubscribe from")
        .addParameter("keyword", ParameterType.Required)
        .setDescription("Unsubscribe from some channels")
        .setCategory("Subscription Commands")
        .setCallback((context) => {
            // try {
            //     var role = context.guild.roles.find(x => x.name === "Event Participant");
            //     if (context.message.member.roles.some(x => x.name === "Event Participant")) {
            //         context.message.member.removeRole(role);
            //         context.message.reply("You have been unsubscribed from `Events`!");
            //     } else {
            //         context.message.reply("You already are unsubscribed");
            //     }
            // } catch (e) {
            //     context.channel.send("***INTERNAL ERROR, PLEASE TRY AGAIN***");
            // }
        });
};
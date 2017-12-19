import { CommandHandler } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite3";

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createCommand('enlist')
        .setDescription('Enlist yourself')
        .setCategory('Hidden Commands')
        .hide()
        .setCallback((context) => {
            try {
                var role = context.guild.roles.find(x => x.name === 'enlisted');
                if (context.message.member.roles.some(x => x.name === 'enlisted')) {
                    context.message.reply("You already have the role!");
                } else {
                    context.message.member.addRole(role);
                    context.message.reply("you've been enlisted!");
                }
            } catch (e) {
                context.channel.send("***INTERNAL ERROR, PLEASE TRY AGAIN***");
            }
            context.message.delete();
        });
};
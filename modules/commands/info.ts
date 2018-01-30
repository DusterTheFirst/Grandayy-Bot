import { CommandHandler } from "mechan.js";
import { Collection, Client, RichEmbed } from "discord.js";
import { Database } from "sqlite";
import humanize = require("humanize-duration");

module.exports.init = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createCommand("info")
        .setDescription("Get some of dat info")
        .setCategory("Info Commands")
        .setCallback((context) => {
            let builder = new RichEmbed();

            let time = process.uptime() * 1000;
            let uptime = humanize(time, {round: true});

            builder.setTitle("Robbie Botten - Info");
            builder.setColor(context.message.guild.me.displayColor);
            builder.setDescription(`Robbie Botten is a discord bot designed for Grandayy's discord server. \nType ***${handler.config.prefix}help*** for all commands`);
            builder.setThumbnail(client.user.displayAvatarURL);
            builder.addField("Bot Info", "Written In: *[javascript](https://www.javascript.com/), running the [node.js](https://nodejs.org/en/) framework*\nVersion: *2.0*\nRuns On: *[discord.js](https://discord.js.org/#/)* and *[mechan.js](https://github.com/DusterTheFirst/mechan.js)*\nSource Code: *[GitHub](https://github.com/DusterTheFirst/RobbieBotten)*\nWebpanel: *[discord.grande1899.com](https://grandayy.github.io)*", true);
            builder.addField("Stats", `Uptime: *${uptime}*\nPing: *${Math.round(client.ping)}ms*\nLines: *Wayy too many*\nTime Wasted: *A lot*`, true);
            builder.addField("Credits", "Avatar: *Carrotzy*\nBot: *DusterTheFirst*\nmechan.js: *DusterTheFirst*\ndiscord.js: *hydrabolt* and contributors", false);

            context.channel.send("", { embed: builder });
        });
};
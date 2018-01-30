import { CommandHandler } from "mechan.js";
import { Collection, Client, Guild, MessageEmbed, RichEmbed } from "discord.js";
import { Database } from "sqlite";

let config: Config;

module.exports.init = (handler: CommandHandler, database: Database, client: Client, c: Config) => {
    config = c;
};

/**
 * Get a guild member from the given guild
 */
export function getGuildMember(x: string, guild: Guild) {
    let mems = guild.members;
    return mems.get(x)
        || mems.find(m =>
                m.user.username.toLowerCase() === x.toLowerCase()
            || m.displayName.toLowerCase() === x.toLowerCase()
            || m.user.tag.toLowerCase() === x.toLowerCase()
            || m.id.toLowerCase() === x.toLowerCase()
            || m.toString().toLowerCase() === x.toLowerCase())
        || null;
}

/**
 * Clean a message embed of circular references
 * @param embed - Embed to clean
 */
function cleanEmbed(embed: MessageEmbed): RichEmbed {
    return new RichEmbed({
        author: embed.author && {
            icon_url: embed.author.iconURL,
            name: embed.author.name,
            url: embed.author.url
        },
        color: embed.color,
        description: embed.description,
        fields: embed.fields.map(x => {
            return {
                name: x.name,
                value: x.value,
                inline: x.inline
            };
        }),
        file: null, // No property?
        footer: embed.footer && {
            icon_url: embed.footer.iconURL,
            text: embed.footer.text
        },
        image: embed.image && {
            height: embed.image.height,
            proxy_url: embed.image.proxyURL,
            url: embed.image.url,
            width: embed.image.width
        },
        thumbnail: embed.thumbnail && {
            height: embed.thumbnail.height,
            url: embed.thumbnail.url,
            width: embed.thumbnail.width
        },
        timestamp: new Date(embed.createdTimestamp),
        title: embed.title,
        url: embed.url,
        video: embed.video && {
            height: embed.video.height,
            width: embed.video.width,
            url: embed.video.url
        }
    });
}
import { CommandHandler } from "mechan.js";
import { Collection, Client, Guild } from "discord.js";
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
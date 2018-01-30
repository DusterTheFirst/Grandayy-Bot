import { CommandHandler, CommandContext } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite";

let config: Config;

module.exports.init = (handler: CommandHandler, database: Database, client: Client, c: Config) => {
    config = c;
};

/** Checks if the member is a staff member */
export function isStaff(context: CommandContext) {
    return context.message.member.hasPermission("KICK_MEMBERS");
}

/** Checks if the user is in the grandayy server */
export function grandayyServer(context: CommandContext) {
    return context.guild.id === config.guild;
}
/** Checks if the user is in the staff server */
export function staffServer(context: CommandContext) {
    return context.guild.id === config.staffguild;
}
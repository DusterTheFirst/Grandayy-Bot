import { CommandHandler } from "mechan.js";
import { Collection, Client } from "discord.js";

module.exports = (handler: CommandHandler, database: Collection<any, any>, client: Client) => {
    handler.createGroup('qotd', (group) => {

    })
}
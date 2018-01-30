import { CommandHandler } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite";
import humanize = require("humanize-duration");

module.exports.init = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createGroup("v", (group) => {
        group.setCategory("Voting Commands");
    });
};
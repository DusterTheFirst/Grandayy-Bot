import { CommandHandler } from "mechan.js";
import { Collection, Client } from "discord.js";
import * as fs from "fs";
import { Database } from "sqlite3";

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    let files = fs.readdirSync(`${__dirname}/commands`);
    for (let file of files) {
        if (fs.lstatSync(`${__dirname}/commands/${file}`).isFile())
            try {
                require(`${__dirname}/commands/${file}`)(handler, database, client, config);
            } catch (e) {
                // console.log(e);
            }
    }
};
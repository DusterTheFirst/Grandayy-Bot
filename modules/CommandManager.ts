import { CommandHandler } from "mechan.js";
import { Collection, Client } from "discord.js";
import * as fs from "fs";
import { Database } from "sqlite";
import chalk from "chalk";

export class CommandManager {

    private handler: CommandHandler;
    private database: Database;
    private client: Client;
    private config: Config;

    constructor(handler: CommandHandler, database: Database, client: Client, config: Config) {
        this.handler = handler;
        this.database = database;
        this.client = client;
        this.config = config;

        let files = fs.readdirSync(`${__dirname}/commands`);
        files = files.filter(x => x.endsWith(".js"));
        files = files.filter(x => !x.startsWith("!"));
        for (let file of files) {
            if (fs.lstatSync(`${__dirname}/commands/${file}`).isFile())
                try {
                    require(`${__dirname}/commands/${file}`).init(handler, database, client, config);
                } catch (e) {
                    console.log(chalk.red(`FAILED INITIALIZATION OF ${file}`), e);
                }
        }
    }

}
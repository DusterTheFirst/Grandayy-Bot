import * as Mechan from "mechan.js";
import * as Discord from "discord.js";
import * as fs from "fs";
import { Database, open } from "sqlite";
import { default as chalk } from "chalk";
import { CommandErrorType, ParameterType } from "mechan.js";
import { CommandManager } from "./modules/CommandManager";
import { TwitterManager } from "./modules/TwitterManager";
import { WebManager } from "./modules/WebManager";

(async () => {
    const config: Config = eval(`($=>{return ${fs.readFileSync(`${__dirname}/config.json`).toString("utf-8")}})()`);

    const handler = new Mechan.CommandHandler({
        prefix: "-",
        mentionPrefix: false,
        helpMode: Mechan.HelpMode.Public,
        isSelfBot: false
    });
    const client = new Discord.Client({
        fetchAllMembers: true
    });

    const database = await open("./SQL/RobbieBotten.sqlite", { promise: Promise, verbose: true });
    database.on("trace", (sql) => console.log(chalk.yellow(sql)));

    let commands = new CommandManager(handler, database, client, config);

    let twitter = new TwitterManager(config, client);

    let web = new WebManager(client, config, database);

    // EVENTS
    handler.on("failure", (h, context) => {
        switch (context.errorType) {
            case CommandErrorType.BadPermissions:
            case CommandErrorType.UnknownCommand:
                break;
            case CommandErrorType.BadArgCount:
            case CommandErrorType.InvalidInput:
                let reqparams = context.command.parameters.filter(x => x && x.type === ParameterType.Required);
                let reqlength = reqparams && reqparams.length || 0;
                let totallength = context.command.parameters.length;
                context.channel.send(`**Invalid arguments:** \`${context.handler.config.prefix}${context.command.fullname}\` requires ${totallength === reqlength ? totallength : `${reqlength} - ${totallength}`} parameters`);
                break;
            default:
                console.log(context.command && context.command.fullname, context.errorType, context.error);
        }
    });

    client.on("error", (msg) => { console.error(chalk.red(`[Error] ${msg.stack}`)); });
    client.on("warn", (msg) => { console.warn(chalk.yellow(`[Warn] ${msg}`)); });
    client.on("debug", (msg) => { if (!msg.startsWith("[ws]")) console.log(chalk.gray(`[Debug] ${msg}`)); });
    client.once("ready", () => {
        console.log(chalk.green(`Logged in with user ${client.user.username}`));
        client.user.setGame("discord.grande1899.com", "https://www.twitch.tv/dusterthefirst");
    });

    handler.install(client)
        .login(config.token);

    // PROCCESS
    process.on("unhandledRejection", (error, p) => {
        if (error instanceof Error)
            console.log(`Unhandled promise rejection: ${error.stack}`);
        else
            console.log(`Unhandled promise rejection: ${error}`);
    });
    process.on("beforeExit", (code) => {
        database.close();
    });
    process.on("uncaughtException", (error) => {
        console.error(error);
    });
})();
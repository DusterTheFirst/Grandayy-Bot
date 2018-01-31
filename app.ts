import * as Mechan from "mechan.js";
import * as Discord from "discord.js";
import * as fs from "fs";
import { Database, open } from "sqlite";
import { default as chalk } from "chalk";
import { CommandErrorType, ParameterType } from "mechan.js";
import { CommandManager } from "./modules/CommandManager";
import { TwitterManager } from "./modules/TwitterManager";
import { WebManager } from "./modules/WebManager";
import { WebhookClient, RichEmbed } from "discord.js";

// CRASH REPORTER
process.on("exit", a);
process.on("uncaughtException", a);
process.on("unhandledRejection", a);
function a(errororcode: Error | number | String) {
    console.error(errororcode);

    let message: String = "RobbieBotten Exited";

    if (errororcode instanceof Error) {
        message = errororcode.stack;
    } else if(typeof errororcode === "string" || errororcode instanceof String) {
        message = errororcode;
    }
    new WebhookClient("407690848327958538", "WNr2njzAyONI_-NdcI1NnpXuItfaTR_0B1IZYoL1sY1bdDspv7Umidh-HUdoA8-MydDn")
        .send(new RichEmbed()
            .setColor("#f04747")
            .setTitle("oh noes.")
            .setDescription(`If you are reading this, all hope is lost\nRobbieBotten has crashed ;-;\n\n*More specifically*: \`\`\`${message}\`\`\``)
            .setFooter("spam duster till he fixes it")
            .setTimestamp());
}

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
                break;
            case CommandErrorType.UnknownCommand:
                // context.channel.send(`Unknown command ${context.handler.config.prefix}**${context.content.split(" ")[0].replace("-", "")}**`);
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
        let statuses = [
            "-help",
            "{users} users",
            "1 guild",
            "( ͡° ͜ʖ ͡°)",
            "call me",
            "aaaaaaaaaaaaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        ];
        setInterval(() => {
            let i = Math.floor(Math.random() * (statuses.length - 1));
            let game = statuses[i].replace(/{users}/g, client.guilds.get(config.guild).memberCount.toString());
            client.user.setGame(game);
        }, 60000);
        // client.user.setGame("-help"/*, "https://www.twitch.tv/dusterthefirst" */);
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
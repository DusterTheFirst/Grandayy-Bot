import { Collection, Client } from "discord.js";
import { CommandHandler, CommandErrorType } from "mechan.js";
import { Database } from "sqlite3";
import { default as chalk } from 'chalk';

module.exports = (handler: CommandHandler, client: Client, config: Config, database: Database) => {
    handler.on('failure', (handler, context) => {
        switch (context.errorType) {
            case CommandErrorType.BadPermissions:
            case CommandErrorType.UnknownCommand:
                break;
            default:
                console.log(context.command && context.command.fullname, context.errorType, context.error);
        }
    });

    client.on("error", (msg) => { console.error(chalk.red(`[Error] ${msg}`)); });
    client.on("warn", (msg) => { console.warn(chalk.yellow(`[Warn] ${msg}`)); });
    client.on("debug", (msg) => {
        if (msg.startsWith("[ws]"))
            return;
        console.log(chalk.gray(`[Debug] ${msg}`));
    });
    client.once("ready", () => {
        console.log(chalk.green(`Logged in with user ${client.user.username}`));
        client.user.setGame("discord.grande1899.com", "https://www.twitch.tv/dusterthefirst");
    
        //  LOAD COMMANDS
        require(__dirname + '/commandloader')(handler, database, client, config);

        //  LOAD TWITTER MODULE
        require(__dirname + '/twitter')(config, client.channels.find('id', config.twitter.channel));

        //  START WEBSERVER
        require(__dirname + '/web')(client, config, client.channels.find('id', config.feedbackchannel), database);
    });
}
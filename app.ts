import * as Mechan from "mechan.js";
import * as Discord from "discord.js";
import * as fs from "fs";
import * as SQLite from "sqlite3";
import { default as chalk } from "chalk";
//SQLite.verbose();

const config: Config = eval(`
(function() {
    return ${fs.readFileSync(__dirname + "/config.json").toString("utf-8")}
}())`);

var handler = new Mechan.CommandHandler({
    prefix: "-",
    mentionPrefix: false,
    helpMode: Mechan.HelpMode.Public,
    isSelfBot: false
});
var client = new Discord.Client({
    fetchAllMembers: true
});

var database = new SQLite.Database("./SQL/RobbieBotten.mdf");
database.on("trace", (sql) => console.log(chalk.yellow(sql)));

database.serialize(() => {
    //  LOAD EVENT HANDLERS
    require(__dirname + "/modules/events")(handler, client, config, database);
});

process.on("beforeExit", (code) => {
    database.close();
});
process.on("uncaughtException", (error) => {
    console.error(error);
});

handler.install(client)
    .login(config.token);

process.on("unhandledRejection", (error, p) => {
    if (error instanceof Error)
        console.log(`Unhandled promise rejection: ${error.stack}`);
    else
        console.log(`Unhandled promise rejection: ${error}`);
});
import * as Mechan from "mechan.js";
import * as Discord from 'discord.js';
import * as fs from 'fs';

const Enmap: any = require('enmap');
const EnmapLevel: any = require('enmap-level');

const config: Config = eval(`
(function() {
    return ${fs.readFileSync(__dirname + "/config.json").toString('utf-8')}
}())`);

var handler = new Mechan.CommandHandler({
    prefix: "rb.",
    mentionPrefix: false,
    helpMode: Mechan.HelpMode.Public,
    isSelfBot: false
});
var client = new Discord.Client();

const tableSource = new EnmapLevel({name: "bottendatabase"});
const database = new Enmap({provider: tableSource, persistent: true});

//  LOAD COMMANDS
require(__dirname + '/modules/commandloader')(handler, database, client);

//  LOAD EVENT HANDLERS (NESTED: init twitter)
require(__dirname + '/modules/events')(handler, client, config, database);

handler.install(client)
    .login(config.token);

process.on('unhandledRejection', (error, p) => {
    if (error instanceof Error)
        console.log(`Unhandled promise rejection: ${error.stack}`);
    else
        console.log(`Unhandled promise rejection: ${error}`);
});
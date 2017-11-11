const Mechan       = require("mechan.js");
const fs           = require('fs');
const Enmap        = require('enmap');
const EnmapLevel   = require('enmap-level');
const config = eval(`
(function() {
    return ${fs.readFileSync(__dirname + "/config.json").toString('utf-8')}
}())`);

var handler = new Mechan.CommandHandler({
    prefix: "rb.",
    mentionPrefix: false,
    helpMode: 'public',
    isSelfBot: false
});
var client = new Mechan.Discord.Client();

const tableSource = new EnmapLevel({name: "bottendatabase"});
const database = new Enmap({provider: tableSource, persistent: true});

//  LOAD COMMANDS
require(__dirname + '/modules/commandloader')(handler, database, client);

//  LOAD EVENT HANDLERS (NESTED: init twitter)
require(__dirname + '/modules/events')(handler, client, config, database);

handler.install(client)
    .login(config.token);
const Mechan = require("mechan.js");
const config = require(__dirname + "/config.json");

var handler = new Mechan.CommandHandler({
    prefix: "rb.",
    mentionPrefix: false,
    helpMode: 'public',
    isSelfBot: false
});
var client = new Mechan.Discord.Client();

//  LOAD COMMANDS
require(__dirname + '/modules/commandloader')(handler);

//  LOAD EVENT HANDLERS (NESTED: init twitter)
require(__dirname + '/modules/events')(handler, client, config);

//  START WEBSERVER
require(__dirname + '/modules/web')();

handler.install(client)
    .login(config.token);
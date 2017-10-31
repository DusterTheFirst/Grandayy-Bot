const Mechan = require("mechan.js");
const config = require("./config.json");

var handler = new Mechan.CommandHandler({
    prefix: "rb.",
    mentionPrefix: false,
    helpMode: 'public',
    isSelfBot: false
});
var client = new Mechan.Discord.Client();

//  LOAD COMMANDS
require('./commandloader')(handler);

//  LOAD EVENT HANDLERS (NESTED: init twitter)
require('./modules/events')(handler, client);

//  CREATE WEBSITE
require('./modules/web')();

handler.install(client)
    .login(config.token);
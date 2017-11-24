let Enmap = require('enmap');
let Mechan = require('mechan.js');
let Client = Mechan.Discord.Client;
let Handler = Mechan.CommandHandler;

/**
 * Function to run on the Initialisation of the command
 * @param {Handler} handler 
 * @param {Enmap} database 
 * @param {Client} client 
 */
module.exports = (handler, database, client) => {
    handler.createCommand('enlist')
        .setDescription('Enlist yourself')
        .setCategory('Hidden Commands')
        .hide()
        .setCallback((context) => {
            try {
                var role = context.guild.roles.find(x => x.name === 'enlisted');
                if (context.message.member.roles.some(x => x.name === 'enlisted')) {
                    context.message.reply("You already have the role!");
                } else {
                    context.message.member.addRole(role);
                    context.message.reply("you've been enlisted!");
                }
            } catch (e) {
                context.channel.send("***INTERNAL ERROR, PLEASE TRY AGAIN***");
            }
            context.message.delete();
        });
}
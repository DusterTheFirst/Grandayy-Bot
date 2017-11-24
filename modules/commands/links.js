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
    handler.createCommand('memes')
        .setDescription('Grandayy\'s meme playlist')
        .setCategory('Helpful Links')
        .setCallback((context) => context.channel.send("https://www.youtube.com/playlist?list=PLd7iEW-IcEboD2dabxaPY2TXKGtkCqyyL"));

    handler.createCommand('noteblocksongs')
        .setDescription('Grande1899\'s noteblock songs playlist')
        .setCategory('Helpful Links')
        .setCallback((context) => context.channel.send("https://www.youtube.com/playlist?list=PL30419C17041A76D9"));

    handler.createCommand('othermemes')
        .setDescription('Grande1899\'s meme playlist')
        .setCategory('Helpful Links')
        .setCallback((context) => context.channel.send("https://www.youtube.com/playlist?list=PLAgzw7vzgd5D5qH9Hqmn83yVnYLUaF-gE"));
}
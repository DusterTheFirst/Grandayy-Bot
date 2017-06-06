const Colors = require("colors");
const Discord = require("discord.js");
const SimplerDiscord = require("simpler-discord");
const Config = require("./config.json");

var Commands = new SimplerDiscord.CommandHandler("\\", {}, 5000);
delete Commands.commands["Utility Commands"];

var Client = new Discord.Client();

Commands.register(new SimplerDiscord.Command("carrotzy", ["image url"], "Carrotzify the image from the url", CarrotCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("carrotzy", null, "Carrotzify the attached image", CarrotCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("fight", ["opponent"], "Gain acess to the nsfw realm", NSFWCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("fight", ["player1", "player2"], "Gain acess to the nsfw realm", NSFWCommand), "Fun Commands");

Commands.register(new SimplerDiscord.Command("nsfw", null, "Gain acess to the nsfw realm", NSFWCommand), "Util Commands");

Commands.register(new SimplerDiscord.Command("memes", null, "Grandayy's meme playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PLd7iEW-IcEboD2dabxaPY2TXKGtkCqyyL"); return true;}), "Helpful Links");
Commands.register(new SimplerDiscord.Command("noteblocksongs", null, "Grande1899's noteblock songs playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PL30419C17041A76D9"); return true; }), "Helpful Links");
Commands.register(new SimplerDiscord.Command("othermemes", null, "Grande1899's meme playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PLAgzw7vzgd5D5qH9Hqmn83yVnYLUaF-gE"); return true; }), "Helpful Links");


function CarrotCommand(message, args, handler) {
    //JIMP
}
function FightCommand(message, args, handler) {
    //RANDSSS
}

function NSFWCommand(message, args, handler) {

}

Client.on("error", (msg) => { console.log(msg.red); });
Client.on("warn", (msg) => { console.log(msg.yellow); });
Client.on("debug", (msg) => {
    if (msg.startsWith("[ws]"))
        return;
    console.log(msg.gray);
});

Client.on("ready", () => {
    console.log(`Logged in with user ${Client.user.username}`.green);
    Client.user.setGame("n00t.js");
});

Client.on("message", (message) => {
    Commands.handle(message);
});

Client.login(Config.token);

/*
Help Commands
\help  - List all commands availible to you
\help [command] - Search for help on a command
Fun Commands
\fight [opponent] - Make the given person fight you to the death
\fight [player1] [player2] - Make the given people fight to the death
\carrotzy  - Carrotzyify the attached image
\carrotzy [url] - Carrotzyify the image from the url
Helpful Links
\memes  - Get Grandayy's memes playlist
\noteblocksongs  - Get Grande1899's noteblock songs playlist
\othermemes  - Get Grande1899's memes playlist
Role Commands
\1k  - ;)
\nsfw  - Give yourself or others access to the NSFW channel
Mon Jun 5th, 2017 at 9:17 PM
*/
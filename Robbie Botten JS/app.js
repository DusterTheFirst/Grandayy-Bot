const Colors = require("colors");
const Discord = require("discord.js");
const SimplerDiscord = require("simpler-discord");
const Config = require("./config.json");
const FightResp = require("./res/fightresp.json");
var Jimp = require("jimp");

var Commands = new SimplerDiscord.CommandHandler("\\", {}, 5000);
var Fight = new SimplerDiscord.RandomMessage(FightResp);
var Two = new SimplerDiscord.RandomMessage([true, false]);
delete Commands.commands["Utility Commands"];

var Client = new Discord.Client();

Commands.register(new SimplerDiscord.Command("carrotzy", ["image url"], "Carrotzify the image from the url", CarrotCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("carrotzy", null, "Carrotzify the attached image", CarrotCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("grandayy", null, "Grandayyify the attached image", GrandayyCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("grandayy", ["image url"], "Grandayyify the image from the url", GrandayyCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("fight", ["opponent"], "Gain acess to the nsfw realm", FightCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("fight", ["player1", "player2"], "Gain acess to the nsfw realm", FightCommand), "Fun Commands");

Commands.register(new SimplerDiscord.Command("nsfw", null, "Gain acess to the nsfw realm", NSFWCommand), "Util Commands");

Commands.register(new SimplerDiscord.Command("memes", null, "Grandayy's meme playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PLd7iEW-IcEboD2dabxaPY2TXKGtkCqyyL"); return true; }), "Helpful Links");
Commands.register(new SimplerDiscord.Command("noteblocksongs", null, "Grande1899's noteblock songs playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PL30419C17041A76D9"); return true; }), "Helpful Links");
Commands.register(new SimplerDiscord.Command("othermemes", null, "Grande1899's meme playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PLAgzw7vzgd5D5qH9Hqmn83yVnYLUaF-gE"); return true; }), "Helpful Links");


function CarrotCommand(message, args, handler) {
    let imageurl = args[0] === undefined ? message.attachments.first() : { url: args[0] };

    if (imageurl === undefined) {
        message.channel.send("**Please attach an image, or give a url to an image**");
        return;
    }

    imageurl = imageurl.url;

    Jimp.read(imageurl).then(function (image) {
        image.pixelate(5)
            .getBuffer(Jimp.MIME_PNG, (error, buffer) => {
            message.channel.send("", {
                files: [{
                    attachment: buffer,
                    name: "carrot.png"
                }]
            });
        });
    });
}
function FightCommand(message, args, handler) {
    let player1 = args[0];
    let player2 = args[1] === undefined ? message.author.username : args[1];

    let out;

    if (Two.choose()) {
        out = Fight.choose().replaceAll("{winner}", `**${player1}**`).replaceAll("{loser}", `**${player2}**`);
    } else {
        out = Fight.choose().replaceAll("{winner}", `**${player2}**`).replaceAll("{loser}", `**${player1}**`);
    }

    message.channel.send(out);
}
function GrandayyCommand(message, args, handler) {
    let imageurl = args[0] === undefined ? message.attachments.first() : { url: args[0] };

    if (imageurl === undefined) {
        message.channel.send("**Please attach an image, or give a url to an image**");
        return;
    }

    imageurl = imageurl.url;

    message.channel.send("**no. ;)**");

    //Jimp.read(imageurl).then(function (image) {
    //    image.composite(5)
    //        .getBuffer(Jimp.MIME_PNG, (error, buffer) => {
    //            message.channel.send("", {
    //                files: [{
    //                    attachment: buffer,
    //                    name: "grandayy.png"
    //                }]
    //            });
    //        });
    //});
}


function NSFWCommand(message, args, handler) {
    var role = message.guild.roles.find(x => x.name === 'nsfw-access');

    if (message.member.roles.some(x => x.name === 'nsfw-access')) {
        message.member.removeRole(role);
        message.channel.send("You have been saved from the depths of hell");
    } else {
        message.member.addRole(role);
        message.channel.send("Why?");
    }

    return true;
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
\fight [opponent] - Make the given person fight you to the death
\fight [player1] [player2] - Make the given people fight to the death
\carrotzy  - Carrotzyify the attached image
\carrotzy [url] - Carrotzyify the image from the url
*/

//
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
//
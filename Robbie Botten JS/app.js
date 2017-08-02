const Colors = require("colors");
const Discord = require("discord.js");
const SimplerDiscord = require("simpler-discord");
const Config = require("./config.json");
const FightResp = require("./res/fightresp.json");
var Jimp = require("jimp");
var TwitterPackage = require('twitter');

var Commands = new SimplerDiscord.CommandHandler("\\", {}, 5000);
var Fight = new SimplerDiscord.RandomMessage(FightResp);
var Two = new SimplerDiscord.RandomMessage([true, false]);
var Twitter = new TwitterPackage(Config.twitter);
delete Commands.commands["Utility Commands"];

var Client = new Discord.Client();

Commands.register(new SimplerDiscord.Command("carrotzy", ["image url"], "Carrotzify the image from the url", CarrotCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("carrotzy", null, "Carrotzify the attached image", CarrotCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("grandayy", null, "Grandayyify the attached image", GrandayyCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("grandayy", ["image url"], "Grandayyify the image from the url", GrandayyCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("fight", ["opponent"], "Fight the given opponent to the death", FightCommand), "Fun Commands");
Commands.register(new SimplerDiscord.Command("fight", ["player1", "player2"], "Make the given perople fight to the death", FightCommand), "Fun Commands");

Commands.register(new SimplerDiscord.Command("info", null, "Get sum of dat info", InfoCommand), "Info Commands");

Commands.register(new SimplerDiscord.Command("memes", null, "Grandayy's meme playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PLd7iEW-IcEboD2dabxaPY2TXKGtkCqyyL"); return true; }), "Helpful Links");
Commands.register(new SimplerDiscord.Command("noteblocksongs", null, "Grande1899's noteblock songs playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PL30419C17041A76D9"); return true; }), "Helpful Links");
Commands.register(new SimplerDiscord.Command("othermemes", null, "Grande1899's meme playlist", (message) => { message.channel.send("https://www.youtube.com/playlist?list=PLAgzw7vzgd5D5qH9Hqmn83yVnYLUaF-gE"); return true; }), "Helpful Links");

Commands.register(new SimplerDiscord.Command("enlist", null, "Enlist yourself", EnlistCommand), "Util commands");

function CarrotCommand(message, args, handler) {
    let imageurl = args[0] === undefined ? message.attachments.first() : { url: args[0] };

    if (imageurl === undefined) {
        message.channel.send("**Please attach an image, or give a url to an image**");
        return;
    }

    imageurl = imageurl.url;

    Jimp.read(imageurl).then(function (image) {
        image.pixelate(image.bitmap.height/20)
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

    var watermark;

    Jimp.read("./res/watermark.png").then(function (image) {
        watermark = image.opacity(.75);
    });

    Jimp.read(imageurl).then(function (image) {
        watermark.resize(watermark.bitmap.width / watermark.bitmap.height * (image.bitmap.height / 5), image.bitmap.height / 5);
        image.composite(watermark, 20, image.bitmap.height - (watermark.bitmap.height + 20))
            .getBuffer(Jimp.MIME_PNG, (error, buffer) => {
                message.channel.send("", {
                    files: [{
                        attachment: buffer,
                        name: "grandayy.png"
                    }]
                });
            });
    });
}

function InfoCommand(message, args, handler) {
    var builder = new Discord.RichEmbed();

    var time = process.uptime();
    var uptime = (time + "").toHHMMSS();

    builder.setTitle("Robbie Botten - Info");
    builder.setColor(message.guild.me.displayColor);
    builder.setDescription(`Robbie Botten is a discord bot designed for Grandayy's discord server. Type ***${Commands.prefix}help***`);
    builder.setThumbnail(Client.user.displayAvatarURL);
    builder.addField("Bot Info", "Written In: *[javascript](https://www.javascript.com/), running the [node.js](https://nodejs.org/en/) framework*\nVersion: *Fuck knows*\nRuns On: *[discord.js](https://discord.js.org/#/)* and *[SimplerDiscord](https://github.com/DusterTheFirst/SimplerDiscord)*\nSource Code: *[All Versions](https://github.com/DusterTheFirst/RobbieBotten)* or *[Node Version](https://github.com/DusterTheFirst/RobbieBotten/tree/master/Robbie%20Botten%20JS)*", true);
    builder.addField("Stats", `Uptime: *${uptime}*\nPing: *${Client.ping}ms*\nLines: *Wayy too many*\nTime Wasted: *A lot*`, true);
    builder.addField("Credits", "Avatar: *Carrotzy*\nBot: *DusterTheFirst*", false);
    
    message.channel.send("", { embed: builder });
}

function EnlistCommand(message, args, handler) {
    var role = message.guild.roles.find(x => x.name === 'enlisted');
    if (message.member.roles.some(x => x.name === 'enlisted')) {
        message.reply("You already have the role!");
    } else {
        message.member.addRole(role);
        message.reply("you've been enlisted!");
    }
    return true;
}


let channel;
let twitter = [
    //3657556095, //Me
    365956744 //Grandayy
];
Twitter.stream('statuses/filter', { follow: twitter.toString() }, (stream) => {
    stream.on('data', (tweet) => {
        if (twitter.includes(tweet.user.id)) { // Only tweets from the user id
            let image_url = "";
            if (tweet.entities.media !== undefined)
                image_url = tweet.entities.media[0].media_url;
            channel.send("", {
                embed: new Discord.RichEmbed()
                    .setTitle(`${tweet.user.name} has a message for his desciples`)
                    .setURL(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
                    .setDescription(replaceMentionsWithLinks(replaceHashtagsWithLinks(tweet.text)))
                    .setImage(image_url)
                    .setThumbnail(tweet.user.profile_image_url)
                    .setColor(tweet.user.profile_background_color)
                    .setFooter("Twooter\u2122")
                    .setTimestamp()
            });
            console.log(`New tweet from ${tweet.user.name}, ${tweet.text}`);
        }
    });

    stream.on('error', (error) => {
        console.log(error);
    });
});

let youtube = [
    "UC0S_JhX3wLCnKgoUpYU0t0g", //Me
    "UCa6TeYZ2DlueFRne5DyAnyg", //Grandayy
    "UC9sY9S-ddN-1E0jD2fFWLig" //Grande1899
];
//YOUBETUBE

Client.on("error", (msg) => { console.log(msg.red); });
Client.on("warn", (msg) => { console.log(msg.yellow); });
Client.on("debug", (msg) => {
    if (msg.startsWith("[ws]"))
        return;
    console.log(msg.gray);
});

Client.on("ready", () => {
    console.log(`Logged in with user ${Client.user.username}`.green);
    Client.user.setGame("cult of purple", "https://www.twitch.tv/discordapp");
    channel = Client.guilds.first().channels.find('name', "grandayystuff");
});

Client.on("message", (message) => {
    Commands.handle(message);
});

Client.login(Config.token);

//
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
};

function replaceMentionsWithLinks(text) {
    return text.replace(/@([a-z\d_]+)/ig, '[@$1](http://twitter.com/$1)');
}
function replaceHashtagsWithLinks(text) {
    return text.replace(/#([a-z\d_]+)/ig, '[#$1](https://twitter.com/hashtag/$1)');
}
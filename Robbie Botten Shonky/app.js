const Colors = require("colors");
const Discord = require("discord.js");
const SimplerDiscord = require("simpler-discord");
const Config = require("./config.json");
var TwitterPackage = require('twitter');

var Commands = new SimplerDiscord.CommandHandler("\\", {}, 5000);
var Twitter = new TwitterPackage(Config.twitter);

var Client = new Discord.Client();

Commands.register(new SimplerDiscord.Command("info", null, "Get sum of dat info", InfoCommand), "Info Commands");

function InfoCommand(message, args, handler) {
    var builder = new Discord.RichEmbed();

    var time = process.uptime();
    var uptime = (time + "").toHHMMSS();

    builder.setTitle("Robbie Botten - Info");
    builder.setColor(message.guild.me.displayColor);
    builder.setDescription(`Robbie Botten is a discord bot designed for Grandayy's discord server, adapted for shonkywonkydonkey's. Type ***${Commands.prefix}help***`);
    builder.setThumbnail(Client.user.displayAvatarURL);
    builder.addField("Bot Info", "Written In: *[javascript](https://www.javascript.com/), running the [node.js](https://nodejs.org/en/) framework*\nVersion: *Fuck knows*\nRuns On: *[discord.js](https://discord.js.org/#/)* and *[SimplerDiscord](https://github.com/DusterTheFirst/SimplerDiscord)*\nSource Code: *[All Versions](https://github.com/DusterTheFirst/RobbieBotten)* or *[Node Version](https://github.com/DusterTheFirst/RobbieBotten/tree/master/Robbie%20Botten%20JS)*", true);
    builder.addField("Stats", `Uptime: *${uptime}*\nPing: *${Client.ping}ms*\nLines: *Wayy too many*\nTime Wasted: *A lot*`, true);
    builder.addField("Credits", "Avatar: *Carrotzy*\nBot: *DusterTheFirst*", false);
    
    message.channel.send("", { embed: builder });
}

let channel;
let twitter = [
    //3657556095, //Me
    816189491366854657 //Shonk
];
Twitter.stream('statuses/filter', { follow: twitter.toString() }, (stream) => {
    stream.on('data', (tweet) => {
        if (twitter.includes(tweet.user.id) && !tweet.in_reply_to_screen_name) { // Only tweets from the user id
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
    channel = Client.guilds.first().channels.find('id', "275809533350117387");
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
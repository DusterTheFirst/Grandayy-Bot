const Colors = require("colors");
const Mechan = require("mechan.js");
const Config = require("./config.json");
const FightResp = require("./res/fightresp.json");
const Jimp = require("jimp");
const TwitterPackage = require('twitter');

var Commands = new Mechan.CommandHandler({
    prefix: "rb.",
    mentionPrefix: false,
    helpMode: 'public',
    isSelfBot: false
});
var Twitter = new TwitterPackage(Config.twitter);

var Client = new Mechan.Discord.Client();

Commands.on('debug', console.log);
Commands.on('warn', console.warn);
Commands.on('error', console.error);

Commands.createCommand('carrotzy')
        .addParameter('image url', 'optional')
        .setDescription('Carrotzify the image from the url or the attached image')
        .setCategory('Fun Commands')
        .setCallback((context) => {
            context.channel.startTyping();
            let imageurl = context.message.attachments.first() ? context.message.attachments.first() : { url: args[0] };
            
            if (imageurl === undefined || imageurl === {}) {
                message.channel.send("**Please attach an image, or give a url to an image**");
                return;
            }

            imageurl = imageurl.url;
        
            Jimp.read(imageurl).then((image) => {
                image.pixelate(image.bitmap.height/20)
                    .getBuffer(Jimp.MIME_PNG, (error, buffer) => {
                        context.message.channel.send("", {
                            files: [{
                                attachment: buffer,
                                name: "carrot.png"
                            }]
                        });
                        context.channel.stopTyping();
                    });
            });
        });


Commands.createCommand('grandayy')
        .addParameter('image url', 'optional')
        .setDescription('Grandayyify the image from the url or the attached image')
        .setCategory('Fun Commands')
        .setCallback((context) => {
            context.channel.startTyping();
            let imageurl = context.message.attachments.first() ? context.message.attachments.first() : { url: args[0] };
            
            if (imageurl === undefined || imageurl === {}) {
                message.channel.send("**Please attach an image, or give a url to an image**");
                return;
            }
        
            imageurl = imageurl.url;
        
            Jimp.read("./res/watermark.png").then((image) => {
                let watermark = image.opacity(.75);
                Jimp.read(imageurl).then((image) => {
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
            });
        });

Commands.createCommand('fight')
        .addParameter('player one', 'required')
        .addParameter('player two', 'optional')
        .setDescription('Make the given person(s) fight to the death')
        .setCategory('Fun Commands')
        .setCallback((context) => {
            let player1 = context.args[0];
            let player2 = context.args[1] === '' ? context.message.author.username : context.args[1];
        
            let out;
        
            if (randomise([true, false, true, false])) {
                out = (randomise(FightResp) + "").replaceAll("{winner}", `**${player1}**`).replaceAll("{loser}", `**${player2}**`);
            } else {
                out = (randomise(FightResp) + "").replaceAll("{winner}", `**${player2}**`).replaceAll("{loser}", `**${player1}**`);
            }
        
            context.channel.send(out);
        });

Commands.createCommand('info')
        .setDescription('Get some of dat info')
        .setCategory('Info Commands')
        .setCallback((context) => {
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
            
            context.channel.send("", { embed: builder });
        });

Commands.createCommand('enlist')
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

Commands.createCommand('memes')
        .setDescription('Grandayy\'s meme playlist')
        .setCategory('Helpful Links')
        .setCallback((context) => context.channel.send("https://www.youtube.com/playlist?list=PLd7iEW-IcEboD2dabxaPY2TXKGtkCqyyL"));

Commands.createCommand('noteblocksongs')
        .setDescription('Grande1899\'s noteblock songs playlist')
        .setCategory('Helpful Links')
        .setCallback((context) => context.channel.send("https://www.youtube.com/playlist?list=PL30419C17041A76D9"));

Commands.createCommand('othermemes')
        .setDescription('Grande1899\'s meme playlist')
        .setCategory('Helpful Links')
        .setCallback((context) => context.channel.send("https://www.youtube.com/playlist?list=PLAgzw7vzgd5D5qH9Hqmn83yVnYLUaF-gE"));

        
let channel;
let twitter = [
    //3657556095, //Me
    365956744 //Grandayy
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
    channel = Client.guilds.first().channels.find('name', "grandayystuff");
});

Commands.install(Client)
        .login(Config.token);

function replaceMentionsWithLinks(text) {
    return text.replace(/@([a-z\d_]+)/ig, '[@$1](http://twitter.com/$1)');
}
function replaceHashtagsWithLinks(text) {
    return text.replace(/#([a-z\d_]+)/ig, '[#$1](https://twitter.com/hashtag/$1)');
}

function randomise(items) {
    let item = Math.floor(Math.random() * items.length);
    return items[item];
}

String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
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
const Colors = require("colors");
const Mechan = require("mechan.js");
const https = require("https");
const qs = require('querystring');
const fs = require('fs');
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
            let imageurl = context.message.attachments.first() ? context.message.attachments.first() : { url: context.args[0] };
            
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
            let imageurl = context.message.attachments.first() ? context.message.attachments.first() : { url: context.args[0] };
            
            if (imageurl === undefined || imageurl === {}) {
                message.channel.send("**Please attach an image, or give a url to an image**");
                return;
            }
        
            imageurl = imageurl.url;
        
            Jimp.read(__dirname + "/res/watermark.png").then((image) => {
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
            var builder = new Mechan.Discord.RichEmbed();
            
            var time = process.uptime();
            var uptime = (time + "").toHHMMSS();
        
            builder.setTitle("Robbie Botten - Info");
            builder.setColor(message.guild.me.displayColor);
            builder.setDescription(`Robbie Botten is a discord bot designed for Grandayy's discord server. Type ***${Commands.prefix}help***`);
            builder.setThumbnail(Client.user.displayAvatarURL);
            builder.addField("Bot Info", "Written In: *[javascript](https://www.javascript.com/), running the [node.js](https://nodejs.org/en/) framework*\nVersion: *Fuck knows*\nRuns On: *[discord.js](https://discord.js.org/#/)* and *[Mechan.js](https://github.com/DusterTheFirst/mechan.js)*\nSource Code: *[All Versions](https://github.com/DusterTheFirst/RobbieBotten)* or *[Node Version](https://github.com/DusterTheFirst/RobbieBotten/tree/master/Robbie%20Botten%20JS)*", true);
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
                embed: new Mechan.Discord.RichEmbed()
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

    
    server.listen(32123);
});

const responses = new Mechan.Discord.WebhookClient('372486252546752518', '1HcfV24CP3IYCZEASOBNmYKiRsAVn-lF7vGT37bTGdum47C6AZpZr6eG9qaeptT-OVxT');

let server = https.createServer({
    cert: fs.readFileSync(__dirname + '/certificate.crt'),
    key: fs.readFileSync(__dirname + "/key.crt")
}, (req, res) => {
    if (req.method === 'POST') {
        var body = '';
        req.on('data', function(chunk) {
          body += chunk;
        });
        req.on('end', function() {
            var data = qs.parse(body);

            if (!data.tag || !data.title || !data.content) {
                res.end('MISSING PARAMETERS YA DOOFUS')
                return;
            }

            Client.guilds.find('id', '306061550693777409').fetchMembers();

            let member = Client.guilds.find('id', '306061550693777409').members.find((member) => member.user.tag.toLowerCase() === data.tag.toLowerCase());

            if (!member) {
                res.end('<h1>Invalid member tag<br>You cannot submit a request with an invalid tag<br>Check your spelling and try again<h1>')
                return;
            }

            res.writeHead(303, {
                Location: "https://grandayy.github.io"
            });
            res.end();

            
            responses.send("", new Mechan.Discord.RichEmbed()
                .setTitle("TITLE: " + data.title)
                .setDescription(data.content)
                .setColor(13380104)
                .setTimestamp()
                .setThumbnail(member.user.avatarURL)
                .addField('Author', `${member.user.tag}`)
                .addField('User-Agent', req.rawHeaders["User-Agent"])
                .addField('IP', req.connection.remoteAddress));

            member.send("The admins of " + Client.guilds.find('id', '306061550693777409').name + " have recieved your feedback\nBelow is an example of what they received\n\nIF YOU DID NOT SEND THIS MESSAGE, PLEASE CONTACT THE ADMINS", 
                new Mechan.Discord.RichEmbed()
                .setTitle("TITLE: " + data.title)
                .setDescription(data.content)
                .setColor(13380104)
                .setTimestamp()
                .setThumbnail(member.user.avatarURL)
                .addField('Author', `${member.user.tag}`))

            // now you can access `data.email` and `data.password`
            // res.writeHead(200);
            // res.end(JSON.stringify(data));
        });
    } else {
        res.writeHead(403);
        res.end();
    }
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
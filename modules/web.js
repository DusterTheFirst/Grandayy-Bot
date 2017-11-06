const Mechan       = require("mechan.js");
const express      = require("express");
const app          = express();
const https        = require("https");
const helmet       = require('helmet');
const fs           = require('fs');
const getRoutes    = require('get-routes');
const bodyParser   = require('body-parser');
const chalk        = require('chalk');
const pubsubhubbub = require('pubsubhubbub');
const xml2js       = require('xml2js');
const googleapis   = require('googleapis');

var configuration;

module.exports = (client, config, youtubechannel, feedbackchannel, database) => {
    configuration = config;

    const guild = client.guilds.find('id', config.guild);

    const youtube = googleapis.youtube({
        version: 'v3',
        auth: config.youtube.apikey
    })
    //const responses = new Mechan.Discord.WebhookClient('372486252546752518', '1HcfV24CP3IYCZEASOBNmYKiRsAVn-lF7vGT37bTGdum47C6AZpZr6eG9qaeptT-OVxT');
    
    var privateKey = fs.readFileSync('key.crt');
    var certificate = fs.readFileSync('certificate.crt');
    
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    })); 

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    
    app.get('/', (req, res) => {
        res.send(error(`This is the endpoint for accessing and sending data to and from @Robbie Botten#3585`,
                       `You may be looking for ${url('https://grandayy.github.io/')}`));
    });

    app.get('/endpoints', (req, res) => {
        var contype = req.headers['content-type'];

        if (contype === 'application/json') {
            res.contentType('json').send(getRoutes(app));
        } else {
            let html = "<h1>Endpoints</h1>";
            
            let routes = getRoutes(app);
            for (method in routes) {
                if (method === 'acl')
                   continue;
                html += `<h2 style="margin-bottom: -5px;">${method.toUpperCase()}</h2><hr>`;
                for (endpoint of routes[method]) {
                    //console.log(method.toUpperCase() + " " + endpoint);
                    html += "&emsp;" + method.toUpperCase() + " " + url(endpoint) + "<br>"
                }
                html += `<br><br>`;
            }
            res.send(html);
        }
    });
    
    app.get('/guild', (req, res) => {
        res.contentType('text').send(trimGuild(guild));
    });
    
    // app.get('/users', (req, res) => {
    //     guild.fetchMembers();
    //     res.contentType('json').send(guild.members.map(x => x.user.id));
    // });

    app.get('/users/withrole/:roleid', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(guild.members.filter(x => x.roles.array().map(x => x.id).includes(req.params.roleid)).map(trimMember));
    });
    app.get('/users/ofstatus/:status', (req, res) => {
        let roles = config.statuses[req.params.status];

        if (!roles) {
            res.contentType('json').send([]);
            return;
        }
        guild.fetchMembers();
        res.contentType('json').send(guild.members.filter(x => x.roles.array().find(x => roles.includes(x.id)) !== undefined).map(trimMember));
    });
    app.get('/users/withdisplayname/:name', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(guild.members.filter(x => x.displayName.toLowerCase().includes(req.params.name.toLowerCase())).map(trimMember));
    });
    app.get('/users/withusername/:name', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(guild.members.filter(x => x.user.username.toLowerCase().includes(req.params.name.toLowerCase())).map(trimMember));
    });
    app.get('/users/withnickname/:name', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(guild.members.filter(x => x.nickname ? x.nickname.toLowerCase().includes(req.params.name.toLowerCase()) : false).map(trimMember));
    });
    app.get('/users/withtag/:name', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(guild.members.filter(x => x.user.tag.toLowerCase().includes(req.params.name.toLowerCase())).map(trimMember));
    });
    // app.get('/users/withids/:listofids', (req, res) => {
    //     guild.fetchMembers();
    //     let ids = req.params.listofids.split(',');
    //     res.contentType('json').send(ids.map(x => {
    //         let member = guild.members.find(x => x.id.toLowerCase() === req.params.userid.toLowerCase());
    //         return member ? trimMember(member) : {}
    //     }));
    // });
    app.get('/user/:userid', (req, res) => {
        guild.fetchMembers();
        let member = guild.members.find(x => x.id.toLowerCase() === req.params.userid.toLowerCase());
        // let statuses = Object.keys(config.statuses).filter(x => x.filter(y => member.roles.array().map(x => x.id).includes(y)) !== undefined);
        // let highestStatus = statuses[0];
        //let level = member.roles.array().filter(() => Object.values(config.levels).indexOf());
        res.contentType('json').send(trimMember(member));
    });

    app.get('/bans', (req, res) => {
        res.send('ALL BANNED MEMBERS');
    });

    app.get('/warns', (req, res) => {
        res.send('ALL WARNNED MEMBERS');
    });
    
    app.get('/roles', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(guild.roles.map(trimRole));
    });
    app.get('/role/:roleid', (req, res) => {
        guild.fetchMembers();
        let role = guild.roles.find(x => x.id.toLowerCase() === req.params.roleid.toLowerCase());
        res.contentType('json').send(trimRole(role));
    });

    app.get('/statuses', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(Object.keys(config.statuses));
    });

    app.get('/info', (req, res) => {
        res.send('Bot info');
    });

    app.get('/me', (req, res) => {
        res.send('YOU');
    });

//#region pubsubhubbub
    let pubSubSubscriber = pubsubhubbub.createServer({
        callbackUrl: config.youtube.callbackurl
    });
    for (user of config.youtube.users) {        
        pubSubSubscriber.unsubscribe(user, config.youtube.hub);
        
        //pubSubSubscriber.subscribe(user, config.youtube.hub);
    }

    pubSubSubscriber.on('error', console.error);
    pubSubSubscriber.on('denied', console.error);

    pubSubSubscriber.on('subscribe', (data) => {
        console.log(chalk.yellow(`Subscribed to ${data.topic} for ${data.lease} milliseconds`));
    });
    pubSubSubscriber.on('unsubscribe', (data) => {
        console.log(chalk.red(`Unsubscribed from ${data.topic}`));
        pubSubSubscriber.subscribe(data.topic, config.youtube.hub);
    });

    pubSubSubscriber.on('feed', (data) => {
        // console.log(data);
        // console.log(data.feed.toString('utf8'));
        xml2js.parseString(data.feed.toString('utf8'), function (err, result) {
            if (!result.feed.entry)
                return;

            let video = result.feed.entry[0];

            youtube.videos.list({
                part: "snippet",
                id: video['yt:videoId']
            },
            (err, videometa) => {
                if (err) 
                    console.error(err);
                if (videometa) {
                    youtube.channels.list({
                        part: "snippet",
                        id: video['yt:channelId']
                    },
                    (err, usermeta) => {
                        if (err)
                            console.error(err);
                        if (usermeta) {
                            //console.log(JSON.stringify(data.items[0].snippet, undefined, 4));
                            try {
                                youtubechannel.send("", {
                                    embed: new Mechan.Discord.RichEmbed()
                                        .setTitle(`${video.author[0].name} uploaded a new video`)
                                        .setURL(video.link[0].$.href)
                                        .setDescription(video.title[0])
                                        .setImage(videometa.items[0].snippet.thumbnails.high.url)
                                        .setThumbnail(usermeta.items[0].snippet.thumbnails.high.url)
                                        .setColor(16201784)
                                        .setFooter("YoubeTube\u2122")
                                        .setTimestamp()
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    });
                }
            });
            console.log(`New video from ${video.author[0].name}, ${video.title[0]}`);

            //console.log(video);
        });
    });

    app.use('/pubsubhubbub', pubSubSubscriber.listener());
//#endregion

    app.post('/feedback', (req, res) => {
        if (!req.body.token || !req.body.type || !req.body.title || !req.body.content) {
            res.status(400);
            res.end(`YOU ARE MISSING THE FOLLOWING 'POST' PARAMETERS:\n` +
                    (req.body.token   ? "" : " - token\n") +
                    (req.body.type    ? "" : " - type\n")  +
                    (req.body.title   ? "" : " - title\n") +
                    (req.body.content ? "" : " - content\n"));
            return;
        }

        guild.fetchMembers();

        https.get({
            hostname: 'discordapp.com',
            path: '/api/v6/users/@me',
            headers: {
                Authorization: req.body.token + " " + req.body.type
            }
        }, (response) => {
            let body = "";

            if (response.statusCode === 401) {
                res.status(401).end('Invalid credentials');
                return;
            }

            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                body = JSON.parse(body);
                console.log(body);

                let member = client.guilds.find('id', '306061550693777409').members.find((member) => member.user.tag.toLowerCase() === body.tag.toLowerCase());
                
                if (!member) {
                    res.status(401).end('You must be in the server to submit feedback')
                    return;
                }
        
                res.writeHead(303, {
                    Location: req.headers.referer
                });
                res.end();
        
                
                feedbackchannel.send("", new Mechan.Discord.RichEmbed()
                    .setTitle("TITLE: " + req.body.title)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField('Author', `${member.user.tag}`)
                    .addField('User-Agent', req.headers["user-agent"])
                    .addField('IP', req.connection.remoteAddress.replace('::ffff:', "")));
        
                member.send("The admins of " + client.guilds.find('id', '306061550693777409').name + " have recieved your feedback\nBelow is an example of what they received\n\nIF YOU DID NOT SEND THIS MESSAGE, PLEASE CONTACT THE ADMINS", 
                    new Mechan.Discord.RichEmbed()
                    .setTitle("TITLE: " + req.body.title)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField('Author', `${member.user.tag}`))
            });
        });
    });
    
    app.all('*', (req, res) => {
        res.status(404).contentType('html').send(error(`404, endpoint does not exist or invalid method used`,
                                    `see ${url('/endpoints')} for all endpoints`));
    });

    app.use((err, req, res, next) => {
        console.error(chalk.red(err.stack));
        res.status(500).contentType('html').send(error("500, Internal error", ``));
    })
    
    let server = https.createServer({
        key: privateKey,
        cert: certificate
    }, app);
    
    server.listen(8080);
}

function error(error, body) {
    return `<h1>${error}</h1>${body}<br><hr><center>Robbie Botten</center>`;
}
function url(url) {
    return `<a href="${url}">${url}</a>`;
}


function trimRole(role) {
    if (!role)
        return {};

    return {
        id:         role.id, 
        color:      role.color, 
        hexColor:   role.hexColor,
        name:       role.name,
        hoist:      role.hoist
    };
}

function trimMember(member) {
    if (!member)
        return {};

    let userLevel = "0";
    let levelColor = undefined;
    for (level of Object.keys(configuration.levels).reverse()) {
        if (member.roles.array().map(x => x.id).includes(configuration.levels[level])) {
            userLevel = level;
            levelColor = member.roles.find(x => x.id === configuration.levels[level]).hexColor;
            break;
        }
    }
    let userStatus = [];
    let topStatus;
    for (status in configuration.statuses) {
        for (statusrole of configuration.statuses[status]) {
            if (member.roles.array().map(x => x.id).includes(statusrole)) {
                userStatus.push(status);

                if (!topStatus)
                    topStatus = status;

                break;
            }
        }
    }

    return {
        tag:            member.user.tag,
        discriminator:  member.user.discriminator,
        username:       member.user.username,
        nickname:       member.nickname,
        displayName:    member.displayName,
        id:             member.id, 
        presence:       member.presence,
        color:          member.displayColor,
        colorHex:       member.displayHexColor,
        avatar:         member.user.displayAvatarURL,
        roles:          member.roles.array().map(x => x.id),
        highestRole:    member.highestRole.id,
        hoistRole:      member.hoistRole.id,
        joined:         member.joinedAt,
        created:        member.user.createdAt,
        bot:            member.user.bot,
        level:          userLevel,
        levelColor:     levelColor,
        statuses:       userStatus,
        displayStatus:  topStatus
    };
}

function trimGuild(guild) {
    if (!guild) 
        return {}

    return {
        id:             guild.id,
        name:           guild.name,
        icon:           guild.iconURL,
        createdAt:      guild.createdAt,
        //emoji:        guild.emoji,
        membercount:    guild.membercount,
        region:         guild.region
    };
}
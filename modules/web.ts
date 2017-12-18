import { Client, Channel, Collection, Guild, GuildMember, TextChannel, RichEmbed, Role } from "discord.js";
import * as Mechan from "mechan.js";
import * as express from "express";
const app = express();
import * as https from "https";
import * as helmet from 'helmet';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import { NextFunction, Response } from "express";
import { Request } from "express-serve-static-core";
import { Database } from "sqlite3";

const chalk: any = require('chalk');
const getRoutes: any = require('get-routes');

var configuration: Config;

module.exports = (client: Client, config: Config, feedbackchannel: TextChannel, database: Database) => {
    configuration = config;

    const guild = client.guilds.find('id', config.guild);
    
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
                       `You may be looking for ${url('https://discord.grande1899.com/')} or ${url('/endpoints')}`));
    });

    app.get('/endpoints', (req, res) => {
        var contype = req.headers['content-type'];

        if (contype === 'application/json') {
            res.contentType('application/json').send(getRoutes(app));
        } else {
            let html = "<h1>Endpoints</h1>";
            
            let routes = getRoutes(app);
            for (let method in routes) {
                if (method === 'acl')
                   continue;
                html += `<h2 style="margin-bottom: -5px;">${method.toUpperCase()}</h2><hr>`;
                for (let endpoint of routes[method]) {
                    //console.log(method.toUpperCase() + " " + endpoint);
                    html += "&emsp;" + method.toUpperCase() + " " + url(endpoint) + "<br>"
                }
                html += `<br><br>`;
            }
            res.send(html);
        }
    });
    
    app.get('/guild', (req, res) => {
        res.contentType('application/json').send(trimGuild(guild));
    });
    
    // app.get('/users', (req, res) => {
    //     guild.fetchMembers();
    //     res.contentType('json').send(guild.members.map(x => x.user.id));
    // });

    app.get('/users', (req, res) => {
        guild.fetchMembers();

        let members = guild.members;
        let params = [
            "role", 
            "status", 
            "displayName", 
            "username", 
            "nickname",
            "bot",
            "level",
            "underLevel",
            "aboveLevel"
        ];
        
        if (req.query.role) {
            if (typeof req.query.role === typeof []) {
                members = members.filter(x => req.query.role.every((v: string) => x.roles.array().map(x => x.id).includes(v)));
            } else {
                members = members.filter(x => x.roles.array().map(x => x.id).includes(req.query.role));
            }
        }
        if (req.query.status) {
            if (typeof req.query.status === typeof []) {
                members = members.filter(x => req.query.status.every((v: string) => trimMember(x).statuses.includes(v)));
            } else {
                members = members.filter(x => trimMember(x).statuses.includes(req.query.status));
            }
        }
        if (req.query.displayName) {
            members = members.filter(x => x.displayName.toLowerCase().includes(req.query.displayName.toLowerCase()));
        }
        if (req.query.username) {
            members = members.filter(x => x.user.username.toLowerCase().includes(req.query.username.toLowerCase()));
        }
        if (req.query.nickname) {
            members = members.filter(x => x.nickname.toLowerCase().includes(req.query.nickname.toLowerCase()));
        }
        if (req.query.bot !== undefined) {
            members = members.filter(x => (req.query.bot.toLowerCase() == 'true') === x.user.bot);
        }
        if (req.query.level) {
            members = members.filter(x => parseInt(trimMember(x).level) === parseInt(req.query.level));
        }
        if (req.query.underLevel) {
            members = members.filter(x => parseInt(trimMember(x).level) < parseInt(req.query.underLevel));
        }
        if (req.query.aboveLevel) {
            members = members.filter(x => parseInt(trimMember(x).level) > parseInt(req.query.aboveLevel));            
        }
        

        if (!Object.keys(req.query).some(x => params.includes(x)))
            res.send({error: "missing GET parameters", parameters: params})
        else
            res.send(members.map(trimMember));
    });
    app.get('/user/:userid', (req, res) => {
        guild.fetchMembers();
        let member = guild.members.find(x => x.id === req.params.userid);
        res.contentType('application/json').send(trimMember(member));
    });

    app.get('/bans', (req, res) => {
        // guild.fetchAuditLogs({type: [22, 23]}).then(audits => {
        //     res.contentType('application/json').send(audits);
        //     console.log(audits);
        // });
        res.send('WHERE WE STOOR');
    });

    app.get('/warns', (req, res) => {
        database.get('SELECT * FROM warns', (error, row) => {
            res.contentType('application/json').send(row);
        });
    });
    
    app.get('/roles', (req, res) => {
        guild.fetchMembers();
        res.contentType('application/json').send(guild.roles.map(trimRole));
    });
    app.get('/role/:roleid', (req, res) => {
        guild.fetchMembers();
        let role = guild.roles.find(x => x.id === req.params.roleid);
        res.contentType('application/json').send(trimRole(role));
    });

    app.get('/statuses', (req, res) => {
        guild.fetchMembers();
        res.contentType('application/json').send(Object.keys(config.statuses));
    });

    app.get('/info', (req, res) => {
        res.send({
            member: trimMember(guild.me),
            guild: trimGuild(guild),
            uptime: process.uptime()
        });
    });

    app.get('/me', (req, res) => {
        if (!req.query.token_type || !req.query.access_token) {
            res.contentType('application/json').send({error: "missing GET parameters", parameters: ["token_type", "access_token"]});
            return;
        }

        https.request({
            host: "discordapp.com",
            path: "/api/v6/users/@me",
            headers: {
                Authorization: req.query.token_type + " " + req.query.access_token
            }
        }, (response) => {
            let data = "";
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                let parseddata = JSON.parse(data);
                
                if (parseddata.code === 0) {
                    res.contentType("application/json").send(data);
                    return;
                }

                let member = guild.members.find(x => x.id === parseddata.id);
                res.contentType('application/json').send(trimMember(member));
            })
        }).end();
    });

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
                let parsedbody = JSON.parse(body);
                console.log(parsedbody);

                let member = client.guilds.find('id', '306061550693777409').members.find((member) => member.user.tag.toLowerCase() === parsedbody.tag.toLowerCase());
                
                if (!member) {
                    res.status(401).end('You must be in the server to submit feedback')
                    return;
                }
        
                res.writeHead(303, {
                    Location: req.headers.referer
                });
                res.end();
        
                
                feedbackchannel.send("", new RichEmbed()
                    .setTitle("TITLE: " + req.body.title)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField('Author', `${member.user.tag}`)
                    .addField('IP', req.connection.remoteAddress.replace('::ffff:', "")));
        
                member.send("The admins of " + client.guilds.find('id', '306061550693777409').name + " have recieved your feedback\nBelow is an example of what they received\n\nIF YOU DID NOT SEND THIS MESSAGE, PLEASE CONTACT THE ADMINS", 
                    new RichEmbed()
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

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(chalk.red(err.stack));
        res.status(500).contentType('html').send(error("500, Internal error", `${err.name}: ${err.message}`));
    })
    
    let server = https.createServer({
        key: privateKey,
        cert: certificate
    }, app);
    
    server.listen(8080);
}

function error(error: string, body: string) {
    return `<h1>${error}</h1>${body}<br><hr><center>Robbie Botten</center>`;
}
function url(url: string) {
    return `<a href="${url}">${url}</a>`;
}


function trimRole(role: Role) {
    if (!role)
        return {
            id:         null, 
            color:      null, 
            hexColor:   null,
            name:       null,
            hoist:      null
        };;

    return {
        id:         role.id, 
        color:      role.color, 
        hexColor:   role.hexColor,
        name:       role.name,
        hoist:      role.hoist
    };
}

function trimMember(member: GuildMember) {
    if (!member)
        return {
            tag:            null,
            discriminator:  null,
            username:       null,
            nickname:       null,
            displayName:    null,
            id:             null, 
            presence:       null,
            color:          null,
            colorHex:       null,
            avatar:         null,
            roles:          null,
            highestRole:    null,
            hoistRole:      null,
            joined:         null,
            created:        null,
            bot:            null,
            level:          null,
            levelColor:     null,
            statuses:       null,
            displayStatus:  null
        };;

    let userLevel = "0";
    let levelColor = undefined;
    for (let level of Object.keys(configuration.levels).reverse()) {
        if (member.roles.array().map(x => x.id).includes(configuration.levels[level])) {
            userLevel = level;
            levelColor = member.roles.find(x => x.id === configuration.levels[level]).hexColor;
            break;
        }
    }
    let userStatus = [];
    let topStatus;
    for (let status in configuration.statuses) {
        for (let statusrole of configuration.statuses[status]) {
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
        roles:          member.roles.array().map(trimRole),
        highestRole:    member.highestRole.id,
        hoistRole:      member.hoistRole ? member.hoistRole.id : undefined,
        joined:         member.joinedAt,
        created:        member.user.createdAt,
        bot:            member.user.bot,
        level:          userLevel,
        levelColor:     levelColor,
        statuses:       userStatus,
        displayStatus:  topStatus
    };
}

function trimGuild(guild: Guild) {
    if (!guild) 
        return {
            id:             null,
            name:           null,
            icon:           null,
            createdAt:      null,
            //emoji:        null,
            membercount:    null,
            region:         null
        }

    return {
        id:             guild.id,
        name:           guild.name,
        icon:           guild.iconURL,
        createdAt:      guild.createdAt,
        //emoji:        guild.emoji,
        membercount:    guild.members.array().length,
        region:         guild.region
    };
}
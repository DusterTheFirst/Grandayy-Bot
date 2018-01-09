import { Client, Channel, Collection, Guild, GuildMember, TextChannel, RichEmbed, Role } from "discord.js";
import * as Mechan from "mechan.js";
import * as express from "express";
const app = express();
import * as https from "https";
import * as helmet from "helmet";
import * as fs from "fs";
import * as bodyParser from "body-parser";
import { NextFunction, Response, Request } from "express";
import { Database } from "sqlite3";
import { WebUtil } from "./webUtil";

import chalk from "chalk";
const getRoutes: any = require("get-routes");

module.exports = (client: Client, config: Config, feedbackchannel: TextChannel, database: Database) => {

    let util = new WebUtil(config);

    const guild = client.guilds.find("id", config.guild);

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

    app.get("/", (req, res) => {
        res.send(util.error(`This is the endpoint for accessing and sending data to and from @Robbie Botten#3585`,
                       `You may be looking for ${util.url("https://discord.grande1899.com/")} or ${util.url("/endpoints")}`));
    });

    app.get("/endpoints", (req, res) => {
        let contype = req.headers["content-type"];

        if (contype === "application/json") {
            res.contentType("application/json").send(getRoutes(app));
        } else {
            let html = "<h1>Endpoints</h1>";

            let routes = getRoutes(app);
            for (let method in routes) {
                if (method === "acl")
                   continue;
                html += `<h2 style="margin-bottom: -5px;">${method.toUpperCase()}</h2><hr>`;
                for (let endpoint of routes[method]) {
                    // console.log(method.toUpperCase() + " " + endpoint);
                    html +=`&emsp;${method.toUpperCase()} ${util.url(endpoint)}<br>`;
                }
                html += `<br><br>`;
            }
            res.send(html);
        }
    });

    app.get("/guild", (req, res) => {
        res.contentType("application/json").send(util.trimGuild(guild));
    });

    app.get("/users", (req, res) => {
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
            members = typeof req.query.role === typeof []
                    ? members.filter(x => req.query.role.every((v: string) => x.roles.array().map(y => y.id).includes(v)))
                    : members = members.filter(x => x.roles.array().map(y => y.id).includes(req.query.role));
        }
        if (req.query.status) {
            members = typeof req.query.status === typeof []
                    ? members = members.filter(x => req.query.status.every((v: string) => util.trimMember(x).statuses.includes(v)))
                    : members = members.filter(x => util.trimMember(x).statuses.includes(req.query.status));
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
            members = members.filter(x => (req.query.bot.toLowerCase() === "true") === x.user.bot);
        }
        if (req.query.level) {
            members = members.filter(x => parseInt(util.trimMember(x).level) === parseInt(req.query.level));
        }
        if (req.query.underLevel) {
            members = members.filter(x => parseInt(util.trimMember(x).level) < parseInt(req.query.underLevel));
        }
        if (req.query.aboveLevel) {
            members = members.filter(x => parseInt(util.trimMember(x).level) > parseInt(req.query.aboveLevel));
        }


        if (!Object.keys(req.query).some(x => params.includes(x)))
            res.send({error: "missing GET parameters", parameters: params});
        else
            res.send(members.map(util.trimMember));
    });
    app.get("/user/:userid", (req, res) => {
        guild.fetchMembers();
        let member = guild.members.find(x => x.id === req.params.userid);
        res.contentType("application/json").send(util.trimMember(member));
    });

    app.get("/bans", (req, res) => {
        // guild.fetchAuditLogs({type: [22, 23]}).then(audits => {
        //     res.contentType("application/json").send(audits);
        //     console.log(audits);
        // });
        res.send("WHERE WE STOOR");
    });

    app.get("/warns", (req, res) => {
        database.get("SELECT * FROM warns", (error, row) => {
            res.contentType("application/json").send(row);
        });
    });

    app.get("/roles", (req, res) => {
        guild.fetchMembers();
        res.contentType("application/json").send(guild.roles.map(util.trimRole));
    });
    app.get("/role/:roleid", (req, res) => {
        guild.fetchMembers();
        let role = guild.roles.find(x => x.id === req.params.roleid);
        res.contentType("application/json").send(util.trimRole(role));
    });

    app.get("/statuses", (req, res) => {
        guild.fetchMembers();
        res.contentType("application/json").send(Object.keys(config.statuses));
    });

    app.get("/info", (req, res) => {
        res.send({
            member: util.trimMember(guild.me),
            guild: util.trimGuild(guild),
            uptime: process.uptime()
        });
    });

    app.get("/me", (req, res) => {
        if (!req.query.token_type || !req.query.access_token) {
            res.contentType("application/json").send({error: "missing GET parameters", parameters: ["token_type", "access_token"]});
            return;
        }

        https.request({
            host: "discordapp.com",
            path: "/api/v6/users/@me",
            headers: {
                Authorization: `${req.query.token_type} ${req.query.access_token}`
            }
        }, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                let parseddata = JSON.parse(data);

                if (parseddata.code === 0) {
                    res.contentType("application/json").send(data);
                    return;
                }

                let member = guild.members.find(x => x.id === parseddata.id);
                res.contentType("application/json").send(util.trimMember(member));
            });
        }).end();
    });

    app.get("/memecup/players", (req, res) => {
        res.contentType("json").send(JSON.stringify([
            {
                "name" : "val",
                "kills" : "69",
                "status" : "alive"
            },
            {
                "name" : "eve",
                "kills" : "1",
                "status" : "alive"
            }
        ]));
    });

    app.get("/memecup", (req, res) => {
        res.contentType("json").send(JSON.stringify({
            "status" : "down",
            "location" : "eu",
            "ping" : "12",
            "uptime" : "2 years"
        }));
    });

    app.post("/feedback", (req, res) => {
        if (!req.body.token || !req.body.type || !req.body.title || !req.body.content) {
            res.status(400);
            res.end("Invalid body");
            return;
        }

        guild.fetchMembers();

        https.get({
            hostname: "discordapp.com",
            path: "/api/v6/users/@me",
            headers: {
                Authorization: `${req.body.token} ${req.body.type}`
            }
        }, (response) => {
            let body = "";

            if (response.statusCode === 401) {
                res.status(401).end("Invalid credentials");
                return;
            }

            response.on("data", (chunk) => {
                body += chunk;
            });
            response.on("end", () => {
                let parsedbody = JSON.parse(body);
                console.log(parsedbody);

                let member = client.guilds.find("id", "306061550693777409").members.find((m) => m.user.tag.toLowerCase() === parsedbody.tag.toLowerCase());

                if (!member) {
                    res.status(401).end("You must be in the server to submit feedback");
                    return;
                }

                res.writeHead(303, {
                    Location: req.headers.referer
                });
                res.end();


                feedbackchannel.send("", new RichEmbed()
                    .setTitle(`TITLE: ${req.body.title}`)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField("Author", `${member.user.tag}`)
                    .addField("IP", req.connection.remoteAddress.replace("::ffff:", "")));

                member.send(`The admins of ${client.guilds.find("id", "306061550693777409").name} have recieved your feedback\nBelow is an example of what they received\n\nIF YOU DID NOT SEND THIS MESSAGE, PLEASE CONTACT THE ADMINS`,
                    new RichEmbed()
                    .setTitle(`TITLE: ${req.body.title}`)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField("Author", `${member.user.tag}`));
            });
        });
    });

    app.all("*", (req, res) => {
        res.status(404).contentType("html").send(util.error(`404, endpoint does not exist or invalid method used`,
                                    `see ${util.url("/endpoints")} for all endpoints`));
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(chalk.red(err.stack));
        res.status(500).contentType("html").send(util.error("500, Internal error", `${err.name}: ${err.message}`));
    });

    let server = https.createServer({
        key: fs.readFileSync("key.crt"),
        cert: fs.readFileSync("certificate.crt")
    }, app);

    server.listen(8080);
};
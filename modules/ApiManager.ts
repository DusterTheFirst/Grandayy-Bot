import { Client, Channel, Collection, Guild, GuildMember, TextChannel, RichEmbed, Role } from "discord.js";
import * as Mechan from "mechan.js";
import * as https from "https";
import * as helmet from "helmet";
import * as fs from "fs";
import * as bodyParser from "body-parser";
import { NextFunction, Response, Request, Router } from "express";
import { Database } from "sqlite";

import chalk from "chalk";

import { forOwn } from "lodash";

function getRoutes(router: Router): { [x: string]: string[] } {
  const routes: { [x: string]: string[] } = {};

  forOwn(router.stack, (middleware: any) => {
    if (!middleware.route) {
      return;
    }

    const method = middleware.route.stack[0].method,
          route = middleware.route.path;

    routes[method] = routes[method] || [];
    routes[method].push(route);
  });

  return routes;
}

export class ApiManager {
    public router: Router;
    private config: Config;
    private client: Client;
    private database: Database;
    public feedbackchannel: TextChannel;
    private guild: Guild;

    constructor(router: Router, client: Client, config: Config, database: Database) {
        this.router = router;
        this.config = config;
        this.client = client;
        this.database = database;

        this.guild = client.guilds.find("id", config.guild);

        this.init();
    }

    public init() {
        this.router.get("/", (req, res) => {
            res.send(this.error(`This is the endpoint for accessing and sending data to and from @Robbie Botten#3585`,
                `You may be looking for ${this.url("https://discord.grande1899.com/")} or ${this.url("/endpoints")}`));
        });

        this.router.get("/endpoints", (req, res) => {
            let contype = req.headers["content-type"];

            if (contype === "application/json") {
                res.contentType("application/json").send(getRoutes(this.router));
            } else {
                let html = "<h1>Endpoints</h1>";

                let routes = getRoutes(this.router);
                for (let method in routes) {
                    if (method === "acl" || method === "undefined")
                        continue;

                    html += `<h2 style="margin-bottom: -5px;">${method.toUpperCase()}</h2><hr>`;
                    for (let endpoint of routes[method]) {
                        // console.log(method.toUpperCase() + " " + endpoint);
                        html += `&emsp;${method.toUpperCase()} ${this.url(endpoint)}<br>`;
                    }
                    html += `<br><br>`;
                }
                res.send(html);
            }
        });

        /*

        this.router.get("/guild", (req, res) => {
            res.contentType("application/json").send(this.trimGuild(this.guild));
        });

        this.router.get("/users", async (req, res) => {
            await this.guild.fetchMembers();

            let members = this.guild.members;
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
                    ? members = members.filter(x => req.query.status.every((v: string) => this.trimMember(x).statuses.includes(v)))
                    : members = members.filter(x => this.trimMember(x).statuses.includes(req.query.status));
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
                members = members.filter(x => parseInt(this.trimMember(x).level) === parseInt(req.query.level));
            }
            if (req.query.underLevel) {
                members = members.filter(x => parseInt(this.trimMember(x).level) < parseInt(req.query.underLevel));
            }
            if (req.query.aboveLevel) {
                members = members.filter(x => parseInt(this.trimMember(x).level) > parseInt(req.query.aboveLevel));
            }


            if (!Object.keys(req.query).some(x => params.includes(x)))
                res.send({ error: "missing GET parameters", parameters: params });
            else
                res.send(members.map(this.trimMember));
        });

        this.router.get("/user/:userid", (req, res) => {
            this.guild.fetchMembers();
            let member = this.guild.members.find(x => x.id === req.params.userid);
            res.contentType("application/json").send(this.trimMember(member));
        });

        this.router.get("/bans", (req, res) => {
            // guild.fetchAuditLogs({type: [22, 23]}).then(audits => {
            //     res.contentType("application/json").send(audits);
            //     console.log(audits);
            // });
            res.send("WHERE WE STOOR");
        });

        this.router.get("/warns", async (req, res) => {
            let warns = await this.database.get("SELECT * FROM warns");
            res.contentType("application/json").send(warns);
        });

        this.router.get("/roles", (req, res) => {
            this.guild.fetchMembers();
            res.contentType("application/json").send(this.guild.roles.map(this.trimRole));
        });

        this.router.get("/role/:roleid", (req, res) => {
            this.guild.fetchMembers();
            let role = this.guild.roles.find(x => x.id === req.params.roleid);
            res.contentType("application/json").send(this.trimRole(role));
        });

        this.router.get("/statuses", (req, res) => {
            this.guild.fetchMembers();
            res.contentType("application/json").send(Object.keys(this.config.statuses));
        });

        this.router.get("/info", (req, res) => {
            res.send({
                member: this.trimMember(this.guild.me),
                guild: this.trimGuild(this.guild),
                uptime: process.uptime()
            });
        });

        this.router.get("/me", (req, res) => {
            if (!req.query.token_type || !req.query.access_token) {
                res.contentType("application/json").send({ error: "missing GET parameters", parameters: ["token_type", "access_token"] });
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

                    let member = this.guild.members.find(x => x.id === parseddata.id);
                    res.contentType("application/json").send(this.trimMember(member));
                });
            }).end();
        });

        */

        this.router.get("/memecup/players", (req, res) => {
            res.contentType("json").send(JSON.stringify([
                {
                    "name": "val",
                    "kills": "69",
                    "status": "alive"
                },
                {
                    "name": "eve",
                    "kills": "1",
                    "status": "alive"
                }
            ]));
        });

        this.router.get("/memecup", (req, res) => {
            res.contentType("json").send(JSON.stringify({
                "status": "down",
                "location": "eu",
                "ping": "12",
                "uptime": "2 years"
            }));
        });

        this.router.post("/memecup/apply", (req, res) => {
            res.contentType("json").send(req.body);
        });

        this.router.post("/feedback", (req, res) => {
            if (!req.body.token || !req.body.type || !req.body.title || !req.body.content) {
                res.status(400);
                res.end("Invalid body");
                return;
            }

            this.guild.fetchMembers();

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

                    let member = this.client.guilds.find("id", "306061550693777409").members.find((m) => m.user.tag.toLowerCase() === parsedbody.tag.toLowerCase());

                    if (!member) {
                        res.status(401).end("You must be in the server to submit feedback");
                        return;
                    }

                    res.writeHead(303, {
                        Location: req.headers.referer
                    });
                    res.end();


                    this.feedbackchannel.send("", new RichEmbed()
                        .setTitle(`TITLE: ${req.body.title}`)
                        .setDescription(req.body.content)
                        .setColor(13380104)
                        .setTimestamp()
                        .setThumbnail(member.user.avatarURL)
                        .addField("Author", `${member.user.tag}`)
                        .addField("IP", req.connection.remoteAddress.replace("::ffff:", "")));

                    member.send(`The admins of ${this.client.guilds.find("id", "306061550693777409").name} have recieved your feedback\nBelow is an example of what they received\n\nIF YOU DID NOT SEND THIS MESSAGE, PLEASE CONTACT THE ADMINS`,
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

        this.router.all("*", (req, res) => {
            res.status(404).contentType("html").send(this.error(`404, endpoint does not exist or invalid method used`,
                `see ${this.url("/endpoints")} for all endpoints`));
        });

        this.router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error(chalk.red(err.stack));
            res.status(500).contentType("html").send(this.error("500, Internal error", `${err.name}: ${err.message}`));
        });
    }

    private error(error: string, body: string) {
        return `<h1>${error}</h1>${body}<br><hr><center>Robbie Botten</center>`;
    }
    private url(url: string) {
        return `<a href="/api${url}">${url}</a>`;
    }
    private trimRole(role: Role) {
        if (!role)
            return {
                id: null,
                color: null,
                hexColor: null,
                name: null,
                hoist: null
            };

        return {
            id: role.id,
            color: role.color,
            hexColor: role.hexColor,
            name: role.name,
            hoist: role.hoist
        };
    }

    private trimMember(member: GuildMember) {
        if (!member)
            return {
                tag: null,
                discriminator: null,
                username: null,
                nickname: null,
                displayName: null,
                id: null,
                presence: null,
                color: null,
                colorHex: null,
                avatar: null,
                roles: null,
                highestRole: null,
                hoistRole: null,
                joined: null,
                created: null,
                bot: null,
                level: null,
                levelColor: null,
                statuses: null,
                displayStatus: null
            };

        let userLevel = "0";
        let levelColor = undefined;
        for (let level of Object.keys(this.config.levels).reverse()) {
            if (member.roles.array().map(x => x.id).includes(this.config.levels[level])) {
                userLevel = level;
                levelColor = member.roles.find(x => x.id === this.config.levels[level]).hexColor;
                break;
            }
        }
        let userStatus = [];
        let topStatus;
        for (let status in this.config.statuses) {
            for (let statusrole of this.config.statuses[status]) {
                if (member.roles.array().map(x => x.id).includes(statusrole)) {
                    userStatus.push(status);

                    if (!topStatus)
                        topStatus = status;

                    break;
                }
            }
        }

        return {
            tag: member.user.tag,
            discriminator: member.user.discriminator,
            username: member.user.username,
            nickname: member.nickname,
            displayName: member.displayName,
            id: member.id,
            presence: member.presence,
            color: member.displayColor,
            colorHex: member.displayHexColor,
            avatar: member.user.displayAvatarURL,
            roles: member.roles.array().map(this.trimRole),
            highestRole: member.highestRole.id,
            hoistRole: member.hoistRole ? member.hoistRole.id : undefined,
            joined: member.joinedAt,
            created: member.user.createdAt,
            bot: member.user.bot,
            level: userLevel,
            levelColor: levelColor,
            statuses: userStatus,
            displayStatus: topStatus
        };
    }

    private trimGuild(guild: Guild) {
        if (!guild)
            return {
                id: null,
                name: null,
                icon: null,
                createdAt: null,
                // emoji:        null,
                membercount: null,
                region: null
            };

        return {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL,
            createdAt: guild.createdAt,
            // emoji:        guild.emoji,
            membercount: guild.members.array().length,
            region: guild.region
        };
    }
}
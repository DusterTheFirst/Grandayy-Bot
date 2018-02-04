import { Client, TextChannel, Guild, GuildMember, Role } from "discord.js";
import { Database } from "sqlite";
import * as express from "express";
import { Application, Router } from "express";
import * as helmet from "helmet";
import * as fs from "fs";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as https from "https";
import { PageManager } from "./PageManager";
import { ApiManager } from "./APIManager";

export class WebManager {
    public client: Client;
    public static config: Config;
    public database: Database;

    private pages: PageManager;
    private api: ApiManager;

    private app: Application;
    private server: https.Server;

    constructor(client: Client, config: Config, database: Database) {
        this.client = client;
        WebManager.config = config;
        this.database = database;

        this.app = express();

        this.app.use(helmet());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cookieParser());
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.pages = new PageManager(this.app, Router(), client, config, database);
        this.api = new ApiManager(this.app, Router(), client, config, database);


        this.app.get("/.well-known/acme-challenge/zUle5wo-OX74O1plRXX05r1grSKbt5EGRzfEixkKk5E", (req, res) => {
            res.send("zUle5wo-OX74O1plRXX05r1grSKbt5EGRzfEixkKk5E.seWQr1fo_yrUrywe8x58ENDvOmypLtvDGRTTr21-uHY");
        });
        this.app.get("/.well-known/acme-challenge/6kOFThmLJw4hmU3nwsnHlFmbGtOLRmLC6vdYqGQRcjc", (req, res) => {
            res.send("6kOFThmLJw4hmU3nwsnHlFmbGtOLRmLC6vdYqGQRcjc.seWQr1fo_yrUrywe8x58ENDvOmypLtvDGRTTr21-uHY");
        });

        this.app.use("/", this.pages.router);
        this.app.use("/api", this.api.router);

        client.on("ready", () => {
            this.api.feedbackchannel = <TextChannel>client.channels.find("id", config.feedbackchannel);
        });
        this.app.listen(8080);
    }

    public static trimRole(role: Role) {
        if (!role)
            return null;

        return {
            color: role.color,
            hexColor: role.hexColor,
            hoist: role.hoist,
            id: role.id,
            name: role.name
        };
    }

    public static trimMember(member: GuildMember) {
        if (!member)
            return null;

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
            avatar: member.user.displayAvatarURL,
            bot: member.user.bot,
            color: member.displayColor,
            colorHex: member.displayHexColor,
            created: member.user.createdAt.getTime(),
            discriminator: member.user.discriminator,
            displayName: member.displayName,
            displayStatus: topStatus,
            highestRole: member.highestRole.id,
            hoistRole: member.hoistRole ? member.hoistRole.id : undefined,
            id: member.id,
            joined: member.joinedAt.getTime(),
            level: userLevel,
            levelColor: levelColor,
            nickname: member.nickname,
            presence: member.presence,
            roles: member.roles.array().map(this.trimRole),
            statuses: userStatus,
            tag: member.user.tag,
            username: member.user.username
        };
    }

    public static trimGuild(guild: Guild) {
        if (!guild)
            return null;

        return {
            // emoji:        guild.emoji,
            createdAt: guild.createdAt.getTime(),
            icon: guild.iconURL,
            id: guild.id,
            membercount: guild.members.array().length,
            name: guild.name,
            region: guild.region
        };
    }

}
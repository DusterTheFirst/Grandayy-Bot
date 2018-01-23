import { Client, TextChannel, Guild, GuildMember, Role } from "discord.js";
import { Database } from "sqlite";
import * as express from "express";
import { Application, Router } from "express";
import * as helmet from "helmet";
import * as fs from "fs";
import * as bodyParser from "body-parser";
import * as https from "https";
import { PageManager } from "./PageManager";
import { ApiManager } from "./APIManager";

export class WebManager {
    public client: Client;
    public config: Config;
    public database: Database;

    private pages: PageManager;
    private api: ApiManager;

    private app: Application;
    private server: https.Server;

    constructor(client: Client, config: Config, database: Database) {
        this.client = client;
        this.config = config;
        this.database = database;

        this.app = express();

        this.app.use(helmet());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.pages = new PageManager(this.app, Router(), client, config, database);
        this.api = new ApiManager(this.app, Router(), client, config, database);

        this.app.use("/", this.pages.router);
        this.app.use("/api", this.api.router);

        client.on("ready", () => {
            this.api.feedbackchannel = <TextChannel>client.channels.find("id", config.feedbackchannel);
        });

        let server = https.createServer({
            key: fs.readFileSync("key.crt"),
            cert: fs.readFileSync("certificate.crt")
        }, this.app);

        server.listen(8080);
    }

}
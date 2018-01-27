import { Database } from "sqlite";
import { Client, Guild } from "discord.js";
import { Router, Application } from "express";
import * as nunjucks from "nunjucks";
import * as ws from "ws";
import * as https from "https";
import * as fs from "fs";

export class PageManager {
    public router: Router;
    private client: Client;
    private config: Config;
    private database: Database;
    private guild: Guild;
    // TODO: remove
    private devmode: boolean = true;

    constructor(app: Application, router: Router, client: Client, config: Config, database: Database) {
        this.router = router;
        this.client = client;
        this.config = config;
        this.database = database;
        client.on("ready", () => {
            this.guild = client.guilds.get(config.guild);
        });

        let hotreload = "";
        if (this.devmode) {
            hotreload = `<script src="/scripts/hotreload.js"></script>`;
            let hotreloadserver = https.createServer({
                key: fs.readFileSync("./certs/key.crt"),
                cert: fs.readFileSync("./certs/cert.crt"),
            }, (req, res) => {res.write("a"); res.end();});
            let hotreloadwss = new ws.Server({
                server: hotreloadserver
            });
            hotreloadserver.listen(6969);
            fs.watch("./modules/pages", {
                recursive: true
            }).on("change", (e, file) => {
                hotreloadwss.clients.forEach((wsocket) => {
                    if (wsocket.readyState = ws.OPEN)
                        wsocket.send(file);
                });
            });
        }

        nunjucks.configure("./modules/pages", {
            autoescape: true,
            express: app,
            noCache: true,
            watch: true
        });

        router.get("/", (req, res) => {
            let meta: PageMeta = {
                description: "The great Grandayy discord server",
                icon: "http://greensportsalliance.org/images/lightGreenSquare.gif",
                name: "Grandayy's Discord Server",
                url: "https://google.com"
            };
            res.render("index.njk", {
                meta: meta,
                hotreload: hotreload
            });
        });

        router.get("/users/:searchterm");

        router.get("/user/:id", (req, res) => {
            let id = req.params.id;

            res.contentType("html");
            res.send(id);
        });

        router.get("/scripts/:filename", (req, res) => {
            res.contentType("js");
            let filename = `./modules/pages/scripts/${req.params.filename}`;
            if (fs.existsSync(filename))
                res.send(fs.readFileSync(filename));
            else
                res.sendStatus(404);
        });
        router.get("/styles/:filename", (req, res) => {
            res.contentType("css");
            let filename = `./modules/pages/sass/compiled/${req.params.filename}`;
            if (fs.existsSync(filename))
                res.send(fs.readFileSync(filename));
            else
                res.sendStatus(404);
        });

        router.use("/join", (req, res) => res.redirect("https://discordapp.com/invite/3sDeWSS"));
    }
}

interface PageMeta {
    description: string;
    icon: string;
    name: string;
    url: string;
}

/**
 * Get a guild member from the given guild
 */
function getGuildMember(x: string, guild: Guild) {
    let mems = guild.members;
    return mems.get(x)
        || mems.find(m =>
                m.user.username.toLowerCase() === x.toLowerCase()
            || m.displayName.toLowerCase() === x.toLowerCase()
            || m.user.tag.toLowerCase() === x.toLowerCase()
            || m.id.toLowerCase() === x.toLowerCase()
            || m.toString().toLowerCase().replace("!", "") === x.toLowerCase().replace("!", ""))
        || null;
}
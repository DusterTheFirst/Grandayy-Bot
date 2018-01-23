import { Database } from "sqlite";
import { Client } from "discord.js";
import { Router, Application } from "express";
import * as nunjucks from "nunjucks";

export class PageManager {
    public router: Router;
    private client: Client;
    private config: Config;
    private database: Database;

    constructor(app: Application, router: Router, client: Client, config: Config, database: Database) {
        this.router = router;
        this.client = client;
        this.config = config;
        this.database = database;

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
            res.render("_template.nj", {
                meta: meta
            });
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
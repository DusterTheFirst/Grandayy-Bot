import { Database } from "sqlite";
import { Client, Guild, User } from "discord.js";
import { Router, Application, Request, Response, NextFunction } from "express";
import * as nunjucks from "nunjucks";
import * as ws from "ws";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as url from "url";
import * as util from "util";
import * as path from "path";
import chalk from "chalk";
import * as sass from "node-sass";
import * as querystring from "querystring";
import { OAuthCodeExpiredError } from "./Error";
import { WebManager, TrimmedMember } from "./WebManager";

export class PageManager {
    public router: Router;
    private client: Client;
    private config: Config;
    private database: Database;
    private guild: Guild;
    // TODO: remove
    private devmode: boolean = true;
    private hotreload = "";

    constructor(app: Application, router: Router, client: Client, config: Config, database: Database) {
        this.router = router;
        this.client = client;
        this.config = config;
        this.database = database;
        client.on("ready", () => {
            this.guild = client.guilds.get(config.guild);
        });


        // let sassfiles = fs.readdirSync("./modules/pages/sass");
        // for (let sfile of sassfiles) {
        //     if (sfile.includes(".css")) continue;
        //     try {
        //         let newfile = sass.renderSync({
        //             file: `./modules/pages/sass/${sfile}`,
        //             outputStyle: "compressed"
        //         });
        //         fs.writeFileSync(`./modules/pages/sass/${sfile.replace(/.scss$/, ".css")}`, newfile.css);
        //     } catch { }
        // }

        if (this.devmode) {
            this.hotreload = `<script src="/scripts/hotreload.js"></script>`;
            let hotreloadserver = http.createServer();
            let hotreloadwss = new ws.Server({
                server: hotreloadserver
            });
            hotreloadserver.listen(6969);
            fs.watch("./modules/pages", {
                recursive: true
            }).on("change", (e, file: String) => {
                if (file.includes(".scss") || file.includes(".ts")) return;
                hotreloadwss.clients.forEach((wsocket) => {
                    if (wsocket.readyState === ws.OPEN)
                        wsocket.send(file);
                });
                console.log(`${chalk.yellow(file.toString())} edited, ${chalk.red("reloading all local connections")}`);
            });
            // fs.watch("./modules/pages/sass", { recursive: true, }, (e, file) => {
            //     if (file.includes(".css")) return;
            //         setTimeout(() => {
            //             try {
            //                 let newfile = sass.renderSync({
            //                     file: `./modules/pages/sass/${file}`,
            //                     outputStyle: "compressed"
            //                 });
            //                 fs.writeFileSync(`./modules/pages/sass/${file.replace(/.scss$/, ".css")}`, newfile.css);
            //                 console.log(`${chalk.yellow(file.toString())} edited, ${chalk.red("compiling into css")}`);
            //             } catch { }
            //         }, 200);
            // });
        }

        nunjucks.configure("./modules/pages", {
            autoescape: true,
            express: app,
            noCache: true,
            watch: true
        });

        router.use("*", async (req, res, next) => {
            let user: OAuthUser = req.cookies && req.cookies.discord_token
                    ? await this.getUserData(JSON.parse(req.cookies.discord_token))
                    : {
                        avatar: "a",
                        avatarURL: "a",
                        discriminator: "a",
                        id: "a",
                        username: "a friggen nerd",
                        verified: false
                    };

            let ip = req.header("X-Forwarded-For") || req.ip.replace(":ffff:", "");

            console.log(`${chalk.yellow(user.username)}||${chalk.red(ip)} requested "${chalk.green(req.baseUrl)}" with method ${chalk.green(req.method)} at the domain ${chalk.blue(req.hostname)} which was referred by ${chalk.blue(req.header("Referer"))}`);
            next();
        });

        router.get("/", async (req, res) => {
            let meta: PageMeta = {
                description: "The website for Grandayy's Discord server",
                icon: "https://botten.dusterthefirst.tk/images/servericon.png",
                name: "Grandayy's Discord Server",
                url: "https://botten.dusterthefirst.tk"
            };
            res.render("index.njk", {
                meta: meta,
                hotreload: this.hotreload,
                templateData: await this.getTemplateInfo(req)
            });
        });


        // router.get("/users/:searchterm");

        // router.get("/user/:id", (req, res) => {
        //     let id = req.params.id;

        //     res.contentType("html");
        //     res.send(id);
        // });

        router.get("/scripts/:filename", (req, res) => {
            res.contentType("js");
            let filename = req.params.filename as string;
            let filepath = `./modules/pages/scripts/${filename}`;
            if (filename.endsWith(".ts") || !filename) {
                res.sendStatus(403);
                return;
            }
            if (fs.existsSync(filepath))
                res.send(fs.readFileSync(filepath));
            else
                res.sendStatus(404);
        });
        router.get("/styles/:filename", (req, res) => {
            res.contentType("css");
            let filename = req.params.filename as string;
            let filepath = `./modules/pages/sass/${filename}`;
            if (filename.endsWith(".scss") || !filename) {
                res.sendStatus(403);
                return;
            }
            if (fs.existsSync(filepath))
                res.send(fs.readFileSync(filepath));
            else
                res.sendStatus(404);
        });
        router.get("/images/:filename", (req, res) => {
            res.contentType("png");
            let filename = req.params.filename as string;
            let filepath = `./modules/pages/images/${filename}`;
            if (fs.existsSync(filepath))
                res.send(fs.readFileSync(filepath));
            else
                res.sendStatus(404);
        });


        router.use("/join", (req, res) => res.redirect("https://discordapp.com/invite/3sDeWSS"));

        router.get("/login", async (req, res) => {
            let hostname = req.hostname === "localhost" ? `${req.hostname}:8080` : req.hostname;
            let redirect_uri = `${req.protocol}://${hostname}/login`;

            if (!req.query.code) {
                res.redirect(`https://discordapp.com/oauth2/authorize?response_type=code&client_id=307231810218360832&scope=identify&state=yourcurrentpathorsomethingcool&redirect_uri=${redirect_uri}`);
                return;
            }

            let token = await this.getToken(req.query.code, redirect_uri).catch(console.log);

            if (token) {
                res.cookie("discord_token", JSON.stringify(token), { expires: new Date(token.expiration) });
            }
            res.redirect("/");
        });

        router.get("/logout", (req, res) => {
            res.clearCookie("discord_token");
            res.redirect("/");
        });

        router.use("*", (req, res) => this.send404(req, res));
        router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
            res.sendStatus(500);
        });
    }

    private send404(req: Request, res: Response) {
        let meta: PageMeta = {
            description: "Grandayy's Discord Server",
            icon: "http://greensportsalliance.org/images/lightGreenSquare.gif",
            name: "404 Page Not Found",
            url: "https://google.com"
        };
        // console.log(req);
        res.render("404.njk", {
            meta: meta,
            hotreload: this.hotreload,
            page: url.parse(req.baseUrl).path
        });
    }

    private async getTemplateInfo(req: Request): Promise<TemplateInfo> {
        let currentPage = req.baseUrl;

        if (req.cookies.discord_token) {
            let discordToken = JSON.parse(req.cookies.discord_token);

            let smallUser = await this.getUserData(discordToken);

            let guildMember = await this.guild.fetchMember(smallUser.id);

            let trimmed = WebManager.trimMember(guildMember);
            return {
                user: trimmed,
                currentPage
            };
        } else {
            return {
                user: null,
                currentPage
            };
        }
    }

    private async getUserData(token: OAuth): Promise<OAuthUser> {
        return new Promise<OAuthUser>(async (resolve, reject) => {
            if (token.expiration < Date.now()) {
                reject("User Token Expired");
                return;
            }
            if (token.expiration - 1000 < Date.now()) {
                token = await this.refreshToken(token);
            }
            https.request({
                host: "discordapp.com",
                path: "/api/v6/users/@me",
                method: "GET",
                headers: {
                    Authorization: `${token.token_type} ${token.access_token}`
                }
            }, (response) => {
                let chunks: Buffer[] = [];
                response.on("data", (chunk) => {
                    chunks.push(chunk as Buffer);
                });
                response.on("end", () => {
                    let body = Buffer.concat(chunks).toString();
                    let got = JSON.parse(body);
                    resolve(got);
                });
            }).end();
        });
    }

    private async refreshToken(previous: OAuth): Promise<OAuth> {
        return new Promise<OAuth>((resolve, reject) => {
            let data = {
                client_id: "307231810218360832",
                client_secret: this.config.clientsecret,
                grant_type: "authorization_code",
                refresh_token: previous.refresh_token,
                redirect_uri: "https://dusterthefirst.ddns.net:8080/login"
            };
            let request = https.request({
                host: "discordapp.com",
                path: "/api/oauth2/token",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }, (response) => {
                let chunks: Buffer[] = [];
                response.on("data", (chunk) => {
                    chunks.push(chunk as Buffer);
                });
                response.on("end", () => {
                    let body = Buffer.concat(chunks).toString();
                    let got = JSON.parse(body);
                    if (got.error) {
                        reject(new OAuthCodeExpiredError());
                    } else {
                        got.expiration = new Date(Date.now() + (got.expires_in * 1000));
                        got.date = Date();
                        resolve(got);
                    }
                });
            });
            request.write(querystring.stringify(data));
            request.end();
        });
    }

    private async getToken(code: string, redirect_uri: string): Promise<OAuth> {
        return new Promise<OAuth>((resolve, reject) => {
            let data = {
                client_id: "307231810218360832",
                client_secret: this.config.clientsecret,
                grant_type: "authorization_code",
                code,
                redirect_uri
            };
            let request = https.request({
                host: "discordapp.com",
                path: "/api/oauth2/token",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }, (response) => {
                let chunks: Buffer[] = [];
                response.on("data", (chunk) => {
                    chunks.push(chunk as Buffer);
                });
                response.on("end", () => {
                    let body = Buffer.concat(chunks).toString();
                    let got = JSON.parse(body);
                    if (got.error) {
                        console.error(got);
                        reject(new OAuthCodeExpiredError());
                    } else {
                        got.expiration = new Date(Date.now() + (got.expires_in * 1000));
                        got.date = Date();
                        resolve(got);
                    }
                });
            });
            request.write(querystring.stringify(data));
            request.end();
        });
    }
}

interface TemplateInfo {
    user: TrimmedMember;
    currentPage: string;
}

interface OAuthUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    avatarURL: string;
    verified: boolean;
}

interface OAuth {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    refresh_token: string;
    scope: "identify";
    date: Date;
    expiration: number;
}

interface PageMeta {
    description: string;
    icon: string;
    name: string;
    url: string;
}
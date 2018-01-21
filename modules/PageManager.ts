import { Database } from "sqlite";
import { Client } from "discord.js";
import { Router } from "express";

export class PageManager {
    public router: Router;
    private client: Client;
    private config: Config;
    private database: Database;

    constructor(router: Router, client: Client, config: Config, database: Database) {
        this.router = router;
        this.client = client;
        this.config = config;
        this.database = database;
    }
}
import { CommandHandler } from "mechan.js";
import { Collection, Client } from "discord.js";
import * as fs from 'fs';

module.exports = (handler: CommandHandler, database: Collection<any, any>, client: Client) => {
    let files = fs.readdirSync(__dirname + '/commands');
    for (let file of files) {
        if (fs.lstatSync(__dirname + `/commands/${file}`).isFile())
            try {
                require(__dirname + `/commands/${file}`)(handler, database, client);
            } catch (e) {
                //console.log(e);
            }
    }
}
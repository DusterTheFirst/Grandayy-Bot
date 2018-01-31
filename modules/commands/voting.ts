import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite";
import humanize = require("humanize-duration");
import { isStaff, staffServer } from "./precheck";

module.exports.init = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createGroup("v", (group) => {
        group.setCategory("Voting Commands");
        group.addCheck(isStaff);
        group.addCheck(staffServer);


        group.createCommand("create")
            .setDescription("Create a staff vote")
            .addParameter("vote", ParameterType.Unparsed)
            .setCallback((context) => {
                context.channel.send("no");
            });
    });

    async function passVote() {

    }
    async function failVote() {

    }
};

interface Vote {
    /** Announced message (for later editing) */
    announcement: string;
    /** Description provided */
    description: string;
    /** Author */
    author: string;
}
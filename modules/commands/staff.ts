import { CommandHandler, CommandContext, ParameterType } from "mechan.js";
import { Collection, Client, RichEmbed, TextChannel } from "discord.js";
import { Database } from "sqlite";
import { isStaff } from "./precheck";

let config: Config;

module.exports.init = (handler: CommandHandler, database: Database, client: Client, cfg: Config) => {
    config = cfg;

    handler.createCommand("pass")
        .addParameter("proposal", ParameterType.Unparsed)
        .hide()
        .addCheck(isStaff)
        .setCallback((context) => {
            (client.channels.get(config.passedproposalschannel) as TextChannel)
                .send(new RichEmbed()
                        .setTitle("PASSED PROPOSAL")
                        .setColor(config.colors.green)
                        .setDescription(context.params.get("proposal")));

            try {
                context.message.delete();
            } catch {}
        });

    handler.createCommand("fail")
        .addParameter("proposal", ParameterType.Unparsed)
        .hide()
        .addCheck(isStaff)
        .setCallback((context) => {
            (client.channels.get(config.failedproposalschannel) as TextChannel)
                .send(new RichEmbed()
                        .setTitle("FAILED PROPOSAL")
                        .setColor(config.colors.red)
                        .setDescription(context.params.get("proposal")));

            try {
                context.message.delete();
            } catch {}
        });
};
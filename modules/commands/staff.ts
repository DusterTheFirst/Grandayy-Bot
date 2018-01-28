import { CommandHandler, CommandContext, ParameterType } from "mechan.js";
import { Collection, Client, RichEmbed, TextChannel } from "discord.js";
import { Database } from "sqlite";

let config: Config;

module.exports = (handler: CommandHandler, database: Database, client: Client, cfg: Config) => {
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

/**
 * Checks if the member is in the mod server
 */
function isStaff(context: CommandContext) {
    let is = context.guild.id === "372420841943859210" && (context.member.roles.array().filter(x => x.name !== "@everyone").length > 0);

    if (!is) {
        context.channel.send(new RichEmbed().setColor(config.colors.red).attachFile("./modules/commands/res/hahaYES.png").setImage("attachment://hahaYES.png"));
    }

    return is;
}
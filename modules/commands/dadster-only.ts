import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite";

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createCommand("say")
        .addParameter("thing", ParameterType.Unparsed)
        .hide()
        .addCheck((context) => context.user.id === "168827261682843648")
        .setCallback((context) => {
            if (context.message.deletable) {
                context.message.delete();
            }
            context.channel.send(context.params.get("thing") as string);
        });
};

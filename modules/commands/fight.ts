import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite";

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    const FightResp: string[] = require(`${__dirname}/res/fightresp.json`);

    handler.createCommand("fight")
        .addParameter("player one", ParameterType.Required)
        .addParameter("player two", ParameterType.Optional)
        .setDescription("Make the given person(s) fight to the death")
        .setCategory("Fun Commands")
        .setCallback((context) => {
            let player1 = context.params.get("player one");
            let player2 = context.params.get("player two") || context.message.author.username;

            let out = randomise(FightResp);

            out = randomise([true, false])
                ? out.replace(/{winner}/g, `**${player1}**`).replace(/{loser}/g, `**${player2}**`)
                : out.replace(/{winner}/g, `**${player2}**`).replace(/{loser}/g, `**${player1}**`);

            context.channel.send(out);
        });
};

function randomise<T>(items: T[]): T {
    let item = Math.floor(Math.random() * items.length);
    return items[item];
}
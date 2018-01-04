import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite3";

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    const FightResp = require(__dirname + "/res/fightresp.json");

    handler.createCommand("fight")
        .addParameter("player one", ParameterType.Required)
        .addParameter("player two", ParameterType.Optional)
        .setDescription("Make the given person(s) fight to the death")
        .setCategory("Fun Commands")
        .setCallback((context) => {
            let player1 = context.params.get("player one");
            let player2 = context.params.get("player two") || context.message.author.username;
        
            let out;
        
            if (randomise([true, false, true, false])) {
                out = (randomise(FightResp) + "").replace(/{winner}/g, `**${player1}**`).replace(/{loser}/g, `**${player2}**`);
            } else {
                out = (randomise(FightResp) + "").replace(/{winner}/g, `**${player2}**`).replace(/{loser}/g, `**${player1}**`);
            }
        
            context.channel.send(out);
        });
};

function randomise(items: any[]) {
    let item = Math.floor(Math.random() * items.length);
    return items[item];
}
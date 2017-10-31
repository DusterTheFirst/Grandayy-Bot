module.exports = (handler) => {
    const FightResp = require(__dirname + "/res/fightresp.json");

    handler.createCommand('fight')
        .addParameter('player one', 'required')
        .addParameter('player two', 'optional')
        .setDescription('Make the given person(s) fight to the death')
        .setCategory('Fun Commands')
        .setCallback((context) => {
            let player1 = context.args[0];
            let player2 = context.args[1] === '' ? context.message.author.username : context.args[1];
        
            let out;
        
            if (randomise([true, false, true, false])) {
                out = (randomise(FightResp) + "").replace(/{winner}/g, `**${player1}**`).replace(/{loser}/g, `**${player2}**`);
            } else {
                out = (randomise(FightResp) + "").replace(/{winner}/g, `**${player2}**`).replace(/{loser}/g, `**${player1}**`);
            }
        
            context.channel.send(out);
        });
}

function randomise(items) {
    let item = Math.floor(Math.random() * items.length);
    return items[item];
}
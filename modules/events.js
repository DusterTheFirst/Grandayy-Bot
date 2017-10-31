module.exports = (handler, client, config) => {
    handler.on('debug', console.log);
    handler.on('warn', console.warn);
    handler.on('error', console.error);

    client.on("error", (msg) => { console.error(`[Error] ${msg}`); });
    client.on("warn", (msg) => { console.warn(`[Warn] ${msg}`); });
    client.on("debug", (msg) => {
        if (msg.startsWith("[ws]"))
            return;
        console.log(`[Debug] ${msg}`);
    });
    client.on("ready", () => {
        console.log(`Logged in with user ${client.user.username}`);
        client.user.setGame("cult of purple", "https://www.twitch.tv/discordapp");
    
        //  LOAD TWITTER MODULE
        require(__dirname + '/twitter')(config, client.guilds.first().channels.find('id', config.twitter.channel));
    });
}
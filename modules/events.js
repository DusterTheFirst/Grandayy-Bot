exports = (handler, client) => {
    handler.on('debug', console.log);
    handler.on('warn', console.warn);
    handler.on('error', console.error);

    client.on("error", (msg) => { console.log(msg.red); });
    client.on("warn", (msg) => { console.log(msg.yellow); });
    client.on("debug", (msg) => {
        if (msg.startsWith("[ws]"))
            return;
        console.log(msg.gray);
    });
    client.on("ready", () => {
        console.log(`Logged in with user ${client.user.username}`.green);
        client.user.setGame("cult of purple", "https://www.twitch.tv/discordapp");
    
        //  LOAD TWITTER MODULE
        require('./modules/twitter')(config, client.guilds.first().channels.find('id', config.twitter.channel));
    
        
        server.listen(32123);
    });
}
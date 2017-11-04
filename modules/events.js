const chalk = require('chalk');

module.exports = (handler, client, config, database) => {
    handler.on('debug', console.log);
    handler.on('warn', console.warn);
    handler.on('error', console.error);

    client.on("error", (msg) => { console.error(chalk.red(`[Error] ${msg}`)); });
    client.on("warn", (msg) => { console.warn(chalk.yellow(`[Warn] ${msg}`)); });
    client.on("debug", (msg) => {
        if (msg.startsWith("[ws]"))
            return;
        console.log(chalk.gray(`[Debug] ${msg}`));
    });
    client.on("ready", () => {
        console.log(chalk.green(`Logged in with user ${client.user.username}`));
        client.user.setGame("cult of purple", "https://www.twitch.tv/discordapp");
    
        //  LOAD TWITTER MODULE
        require(__dirname + '/twitter')(config, client.channels.find('id', config.twitter.channel));

        //  START WEBSERVER
        require(__dirname + '/web')(client, config, client.channels.find('id', config.youtube.channel), client.channels.find('id', config.feedbackchannel), database);
    });
}
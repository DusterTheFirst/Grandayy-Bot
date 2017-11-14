const pubsubhubbub = require('pubsubhubbub');
const xml2js       = require('xml2js');
const googleapis   = require('googleapis');

module.exports = (config, app) => {
    const youtube = googleapis.youtube({
        version: 'v3',
        auth: config.youtube.apikey
    })

    let pubSubSubscriber = pubsubhubbub.createServer({
        callbackUrl: config.youtube.callbackurl
    });
    for (user of config.youtube.users) {        
        pubSubSubscriber.unsubscribe(user, config.youtube.hub);
        
        //pubSubSubscriber.subscribe(user, config.youtube.hub);
    }

    pubSubSubscriber.on('error', console.error);
    pubSubSubscriber.on('denied', console.error);

    pubSubSubscriber.on('subscribe', (data) => {
        console.log(chalk.yellow(`Subscribed to ${data.topic} for ${data.lease} milliseconds`));
    });
    pubSubSubscriber.on('unsubscribe', (data) => {
        console.log(chalk.red(`Unsubscribed from ${data.topic}`));
        pubSubSubscriber.subscribe(data.topic, config.youtube.hub);
    });

    pubSubSubscriber.on('feed', (data) => {
        // console.log(data);
        // console.log(data.feed.toString('utf8'));
        xml2js.parseString(data.feed.toString('utf8'), function (err, result) {
            if (!result.feed.entry)
                return;

            let video = result.feed.entry[0];

            youtube.videos.list({
                part: "snippet",
                id: video['yt:videoId']
            },
            (err, videometa) => {
                if (err) 
                    console.error(err);
                if (videometa) {
                    youtube.channels.list({
                        part: "snippet",
                        id: video['yt:channelId']
                    },
                    (err, usermeta) => {
                        if (err)
                            console.error(err);
                        if (usermeta) {
                            //console.log(JSON.stringify(data.items[0].snippet, undefined, 4));
                            try {
                                youtubechannel.send("", {
                                    embed: new Mechan.Discord.RichEmbed()
                                        .setTitle(`${video.author[0].name} uploaded a new video`)
                                        .setURL(video.link[0].$.href)
                                        .setDescription(video.title[0])
                                        .setImage(videometa.items[0].snippet.thumbnails.high.url)
                                        .setThumbnail(usermeta.items[0].snippet.thumbnails.high.url)
                                        .setColor(16201784)
                                        .setFooter("YoubeTube\u2122")
                                        .setTimestamp()
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    });
                }
            });
            console.log(`New video from ${video.author[0].name}, ${video.title[0]}`);

            //console.log(video);
        });
    });

    app.use('/pubsubhubbub', pubSubSubscriber.listener());
}
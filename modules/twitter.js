const TwitterPackage = require('twitter');

module.exports = (config, channel) => {
    var twitter = new TwitterPackage(config.twitter);

    let twitteraccounts = [
        //3657556095, //Me
        365956744 //Grandayy
    ];
    
    twitter.stream('statuses/filter', { follow: twitteraccounts.toString() }, (stream) => {
        stream.on('data', (tweet) => {
            if (twitteraccounts.includes(tweet.user.id) && !tweet.in_reply_to_screen_name) { // Only tweets from the user id
                let image_url = "";
                if (tweet.entities.media !== undefined)
                    image_url = tweet.entities.media[0].media_url;
                channel.send("", {
                    embed: new Mechan.Discord.RichEmbed()
                        .setTitle(`${tweet.user.name} has a message for his desciples`)
                        .setURL(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
                        .setDescription(replaceMentionsWithLinks(replaceHashtagsWithLinks(tweet.text)))
                        .setImage(image_url)
                        .setThumbnail(tweet.user.profile_image_url)
                        .setColor(tweet.user.profile_background_color)
                        .setFooter("Twooter\u2122")
                        .setTimestamp()
                });
                console.log(`New tweet from ${tweet.user.name}, ${tweet.text}`);
            }
        });
    
        stream.on('error', (error) => {
            console.log(error);
        });
    });

    function replaceMentionsWithLinks(text) {
        return text.replace(/@([a-z\d_]+)/ig, '[@$1](http://twitter.com/$1)');
    }
    function replaceHashtagsWithLinks(text) {
        return text.replace(/#([a-z\d_]+)/ig, '[#$1](https://twitter.com/hashtag/$1)');
    }
}
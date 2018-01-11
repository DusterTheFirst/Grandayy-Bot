import { RichEmbed, TextChannel, Client } from "discord.js";
import { Readable } from "stream";
const Twitter = require("twitter");

export class TwitterManager {

    private config: Config;
    private channel: TextChannel;
    private client: Client;
    private twitter: any;
    private accounts: number[];

    constructor(config: Config, client: Client) {
        this.config = config;
        this.client = client;

        client.on("ready", () => {
            this.channel = <TextChannel> client.channels.find("id", config.twitter.channel);
        });

        this.twitter = new Twitter(config.twitter);

        this.accounts = config.twitter.users;

        this.twitter.stream("statuses/filter", { follow: this.accounts.toString() }, (stream: Readable) => {
            stream.on("data", (tweet: any) => {
                if (this.accounts.includes(tweet.user.id) && !tweet.in_reply_to_screen_name) { // Only tweets from the user id
                    let image_url = "";

                    if (tweet.entities.media !== undefined)
                        image_url = tweet.entities.media[0].media_url;

                    this.channel.send("", {
                        embed: new RichEmbed()
                            .setTitle(`${tweet.user.name} tweeted`)
                            .setURL(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
                            .setDescription(this.createLinks(tweet.text))
                            .setImage(image_url)
                            .setThumbnail(tweet.user.profile_image_url)
                            .setColor(tweet.user.profile_background_color)
                            .setFooter("Twooter\u2122")
                            .setTimestamp()
                    });

                    // console.log(`New tweet from ${tweet.user.name}, ${tweet.text}`);
                }
            });

            stream.on("error", (error: Error) => {
                console.log(error);
            });
        });
    }

    public createLinks(text: string) {
        return this.replaceMentionsWithLinks(this.replaceHashtagsWithLinks(text));
    }

    private replaceMentionsWithLinks(text: string) {
        return text.replace(/@([a-z\d_]+)/ig, "[@$1](http://twitter.com/$1)");
    }
    private replaceHashtagsWithLinks(text: string) {
        return text.replace(/#([a-z\d_]+)/ig, "[#$1](https://twitter.com/hashtag/$1)");
    }

}
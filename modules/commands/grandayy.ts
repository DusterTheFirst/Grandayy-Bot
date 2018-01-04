import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import * as Jimp from "jimp";
import { Database } from "sqlite3";

module.exports = (handler: CommandHandler, databaseL: Database, client: Client, config: Config) => {
    handler.createCommand("grandayy")
        .addParameter("image url", ParameterType.Optional)
        .setDescription("Grandayyify the image from the url or the attached image")
        .setCategory("Fun Commands")
        .setCallback((context) => {
            context.channel.startTyping();
            let image = context.message.attachments.first() || { url: context.params.get("image url")};
            
            if (image.url === undefined) {
                context.message.channel.send("**Please attach an image, or give a url to an image**");
                return;
            }
        
            let imageurl = image.url;
        
            Jimp.read(__dirname + "/res/watermark.png").then((image) => {
                let watermark = image.opacity(.75);
                Jimp.read(imageurl).then((image) => {
                    watermark.resize(watermark.bitmap.width / watermark.bitmap.height * (image.bitmap.height / 5), image.bitmap.height / 5);
                    image.composite(watermark, 20, image.bitmap.height - (watermark.bitmap.height + 20))
                        .getBuffer(Jimp.MIME_PNG, (error, buffer) => {
                            context.channel.send("", {
                                files: [{
                                    attachment: buffer,
                                    name: "grandayy.png"
                                }]
                            });
                        });
                }).catch((reason) => {
                    context.message.channel.send(`**${reason}**`);
                    return;
                });
            });
        });
};
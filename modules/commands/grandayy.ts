import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import * as Jimp from "jimp";
import { Database } from "sqlite";

module.exports.init = (handler: CommandHandler, databaseL: Database, client: Client, config: Config) => {
    handler.createCommand("grandayy")
        .addParameter("image url", ParameterType.Optional)
        .setDescription("Grandayyify the image from the url or the attached image")
        .setCategory("Fun Commands")
        .setCallback(async (context) => {
            context.channel.startTyping();
            let image = context.message.attachments.first() || { url: context.params.get("image url")};

            if (image.url === undefined) {
                context.message.channel.send("**Please attach an image, or give a url to an image**");
                context.channel.stopTyping();
                return;
            }

            let imageurl = image.url;

            let watermark = await Jimp.read(`${__dirname}/res/watermark.png`);
            watermark = watermark.opacity(.75);

            let inputtedimage = await Jimp.read(imageurl).catch((reason: string | Error) => {
                if (reason instanceof Error && reason.message.includes("no such file or directory,")) context.message.channel.send(`**Invalid URL**`);
                else context.message.channel.send(`**${reason}**`);
                context.channel.stopTyping();
                return;
            });

            if (inputtedimage) {
                watermark.resize(watermark.bitmap.width / watermark.bitmap.height * (inputtedimage.bitmap.height / 5), inputtedimage.bitmap.height / 5);
                inputtedimage.composite(watermark, 20, inputtedimage.bitmap.height - (watermark.bitmap.height + 20))
                    .getBuffer(Jimp.MIME_PNG, (error, buffer) => {
                        context.channel.send("", {
                            files: [{
                                attachment: buffer,
                                name: "grandayy.png"
                            }]
                        });
                        context.channel.stopTyping();
                    });
            }
        });
};
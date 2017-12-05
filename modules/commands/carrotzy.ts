import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import * as Jimp from 'jimp';

module.exports = (handler: CommandHandler, database: Collection<any, any>, client: Client) => {
    handler.createCommand('carrotzy')
        .addParameter('image url', ParameterType.Optional)
        .setDescription('Carrotzify the image from the url or the attached image')
        .setCategory('Fun Commands')
        .setCallback((context) => {
            context.channel.startTyping();
            let image = context.message.attachments.first() ? context.message.attachments.first() : { url: context.params.get('image url') };
            
            if (image === undefined || image === {}) {
                context.channel.send("**Please attach an image, or give a url to an image**");
                return;
            }

            let imageurl = image.url;
        
            Jimp.read(imageurl).then((image) => {
                (image as any).pixelate(image.bitmap.height/20)
                    .getBuffer(Jimp.MIME_PNG, (error: Error, buffer: Buffer) => {
                        context.message.channel.send("", {
                            files: [{
                                attachment: buffer,
                                name: "carrot.png"
                            }]
                        });
                        context.channel.stopTyping();
                    });
            }).catch((reason) => {
                context.message.channel.send(`**${reason}**`);
                return;
            });
        });
}
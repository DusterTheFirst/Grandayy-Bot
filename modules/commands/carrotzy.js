const Jimp = require("jimp");
let Enmap = require('enmap');
let Mechan = require('mechan.js');
let Client = Mechan.Discord.Client;
let Handler = Mechan.CommandHandler;

/**
 * Function to run on the Initialisation of the command
 * @param {Handler} handler 
 * @param {Enmap} database 
 * @param {Client} client 
 */
module.exports = (handler, database, client) => {
    handler.createCommand('carrotzy')
        .addParameter('image url', 'optional')
        .setDescription('Carrotzify the image from the url or the attached image')
        .setCategory('Fun Commands')
        .setCallback((context) => {
            context.channel.startTyping();
            let imageurl = context.message.attachments.first() ? context.message.attachments.first() : { url: context.args[0] };
            
            if (imageurl === undefined || imageurl === {}) {
                context.channel.send("**Please attach an image, or give a url to an image**");
                return;
            }

            imageurl = imageurl.url;
        
            Jimp.read(imageurl).then((image) => {
                image.pixelate(image.bitmap.height/20)
                    .getBuffer(Jimp.MIME_PNG, (error, buffer) => {
                        context.message.channel.send("", {
                            files: [{
                                attachment: buffer,
                                name: "carrot.png"
                            }]
                        });
                        context.channel.stopTyping();
                    });
            });
        });
}
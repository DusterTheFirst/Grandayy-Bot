const Jimp = require("jimp");

module.exports = (handler) => {
    handler.createCommand('grandayy')
        .addParameter('image url', 'optional')
        .setDescription('Grandayyify the image from the url or the attached image')
        .setCategory('Fun Commands')
        .setCallback((context) => {
            context.channel.startTyping();
            let imageurl = context.message.attachments.first() ? context.message.attachments.first() : { url: context.args[0] };
            
            if (imageurl === undefined || imageurl === {}) {
                message.channel.send("**Please attach an image, or give a url to an image**");
                return;
            }
        
            imageurl = imageurl.url;
        
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
                });
            });
        });
}
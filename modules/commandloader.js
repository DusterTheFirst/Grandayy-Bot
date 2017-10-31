const fs = require('fs');

module.exports = (handler) => {
    let files = fs.readdirSync(__dirname + '/commands');
    for (let file of files) {
        if (fs.lstatSync(__dirname + `/commands/${file}`).isFile())
            require(__dirname + `/commands/${file}`)(handler);
    }
}
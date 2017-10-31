const fs = require('fs');

exports = (handler) => {
    let files = fs.readdirSync('./commands');
    for (let file of files) {
        require(`./commands/${file}`)(handler);
    }
}
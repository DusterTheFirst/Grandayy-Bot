const Mechan     = require("mechan.js");
const express    = require("express");
const app        = express();
const https      = require("https");
const helmet     = require('helmet');
const fs         = require('fs');
const getRoutes  = require('get-routes');
const bodyParser = require('body-parser');

module.exports = (client) => {
    const responses = new Mechan.Discord.WebhookClient('372486252546752518', '1HcfV24CP3IYCZEASOBNmYKiRsAVn-lF7vGT37bTGdum47C6AZpZr6eG9qaeptT-OVxT');
    
    var privateKey = fs.readFileSync('key.crt');
    var certificate = fs.readFileSync('certificate.crt');
    
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    })); 

    app.get('/', (req, res) => {
        res.writeHead(303, {
            Location: 'https://grandayy.github.io/'
        });
        res.end();
    });

    app.get('/endpoints', (req, res) => {
        let routes = getRoutes(app);
        res.contentType('application/json').send(JSON.stringify(routes, undefined, 4));
    });
    
    app.post('/feedback', (req, res) => {
        if (!req.body.token || !req.body.type || !req.body.title || !req.body.content) {
            res.status(400);
            res.end(`YOU ARE MISSING THE FOLLOWING 'POST' PARAMETERS:\n` +
                    (req.body.token   ? "" : " - token\n") +
                    (req.body.type    ? "" : " - type\n")  +
                    (req.body.title   ? "" : " - title\n") +
                    (req.body.content ? "" : " - content\n"));
            return;
        }

        client.guilds.find('id', '306061550693777409').fetchMembers();

        https.get({
            hostname: 'discordapp.com',
            path: '/api/v6/users/@me',
            headers: {
                Authorization: req.body.token + " " + req.body.type
            }
        }, (response) => {
            let body = "";

            if (response.statusCode === 401) {
                res.status(401).end('Invalid credentials');
                return;
            }

            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                body = JSON.parse(body);
                console.log(body);

                let member = client.guilds.find('id', '306061550693777409').members.find((member) => member.user.tag.toLowerCase() === body.tag.toLowerCase());
                
                if (!member) {
                    res.status(401).end('You must be in the server to submit feedback')
                    return;
                }
        
                res.writeHead(303, {
                    Location: req.headers.referer
                });
                res.end();
        
                
                responses.send("", new Mechan.Discord.RichEmbed()
                    .setTitle("TITLE: " + req.body.title)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField('Author', `${member.user.tag}`)
                    .addField('User-Agent', req.headers["user-agent"])
                    .addField('IP', req.connection.remoteAddress.replace('::ffff:', "")));
        
                member.send("The admins of " + client.guilds.find('id', '306061550693777409').name + " have recieved your feedback\nBelow is an example of what they received\n\nIF YOU DID NOT SEND THIS MESSAGE, PLEASE CONTACT THE ADMINS", 
                    new Mechan.Discord.RichEmbed()
                    .setTitle("TITLE: " + req.body.title)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField('Author', `${member.user.tag}`))
            });
        });
    });
    
    app.get('/guild/', (req, res) => {
        res.send('GUILD INFO');
    });
    
    app.get('/users/:userid', (req, res) => {
        res.send('USER INFO FOR USER ' + req.params.userid);
    });
    
    app.get('/staff/', (req, res) => {
        res.send('ALL STAFF MEMBERS');
    });
    
    app.get('/roles/', (req, res) => {
        res.send('ALL ROLES');
    });
    
    app.post('/me', (req, res) => {
        res.send('YOU');
    });
    
    app.all('*', function(req, res){
        res.status(404).send('404 endpoint does not exist or invalid method used, for more info on endpoints, referance /endpoints');
    });
    
    let server = https.createServer({
        key: privateKey,
        cert: certificate
    }, app);

    server.listen(32123);
}

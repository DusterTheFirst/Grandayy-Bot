const Mechan = require("mechan.js");
const express = require("express");
const https = require("https");
const qs = require('querystring');
const helmet = require('helmet');
const fs = require('fs');

exports = () => {
    const responses = new Mechan.Discord.WebhookClient('372486252546752518', '1HcfV24CP3IYCZEASOBNmYKiRsAVn-lF7vGT37bTGdum47C6AZpZr6eG9qaeptT-OVxT');
    
    var privateKey = fs.readFileSync('key.crt');
    var certificate = fs.readFileSync('certificate.crt');
    
    let app = express();
    
    app.use(helmet());
    
    app.get('/', (req, res) => {
        res.sendStatus(404);
    });
    
    app.all('/feedback', (req, res) => {
        if (req.method !== "POST") {
            res.status(403);
            res.send("you must POST /feedback");
            return;
        }
    
        var body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            let request = qs.parse(body);
    
            if (!request.token || !request.type || !request.title || !request.content) {
                res.status(400);
                res.end(`YOU ARE MISSING THE FOLLOWING 'POST' PARAMETERS:\n` +
                        (request.token   ? "" : " - token\n") +
                        (request.type    ? "" : " - type\n")  +
                        (request.title   ? "" : " - title\n") +
                        (request.content ? "" : " - content\n"));
                return;
            }
    
            client.guilds.find('id', '306061550693777409').fetchMembers();
    
            https.request({
                hostname: 'discordapp.com',
                path: '/api/v6/users/@me',
                method: 'GET',
                headers: {
                    Authorization: request.token + " " + request.type
                }
            }, (res) => {
                let response = "";
    
                req.on('data', (chunk) => {
                    response += chunk;
                });
                req.on('end', () => {
                    response = JSON.parse(response);
                    console.log(response);
    
                    let member = client.guilds.find('id', '306061550693777409').members.find((member) => member.user.tag.toLowerCase() === request.tag.toLowerCase());
                    
                    if (!member) {
                        res.end('<h1>You must be in the server to submit feedback</h1>')
                        return;
                    }
            
                    res.writeHead(303, {
                        Location: req.headers.referer
                    });
                    res.end();
            
                    
                    responses.send("", new Mechan.Discord.RichEmbed()
                        .setTitle("TITLE: " + request.title)
                        .setDescription(request.content)
                        .setColor(13380104)
                        .setTimestamp()
                        .setThumbnail(member.user.avatarURL)
                        .addField('Author', `${member.user.tag}`)
                        .addField('User-Agent', req.headers["user-agent"])
                        .addField('IP', req.connection.remoteAddress.replace('::ffff:', "")));
            
                    member.send("The admins of " + client.guilds.find('id', '306061550693777409').name + " have recieved your feedback\nBelow is an example of what they received\n\nIF YOU DID NOT SEND THIS MESSAGE, PLEASE CONTACT THE ADMINS", 
                        new Mechan.Discord.RichEmbed()
                        .setTitle("TITLE: " + request.title)
                        .setDescription(request.content)
                        .setColor(13380104)
                        .setTimestamp()
                        .setThumbnail(member.user.avatarURL)
                        .addField('Author', `${member.user.tag}`))
                });
            });
        });
    });
    
    // app.get('/api', (req, res) => {
    //     res.send('API ENDPOINT');    
    // });
    
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
        res.status(404).send('404 path not foundified');
    });
    
    let server = https.createServer({
        key: privateKey,
        cert: certificate
    }, app);
}
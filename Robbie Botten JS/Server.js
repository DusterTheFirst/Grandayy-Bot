var http = require("http"),
    path = require("path"),
    fs = require("fs"),
    mime = require("mime"),
    util = require('util'),
    qs = require('querystring'),
    Discord = require('discord.js'),
    port = 1,
    client;

var server = http.createServer(function (req, resp) {
    var url = req.url.split("?")[0];

    if (url === "/solve") {
        resp.writeHead(403);
        resp.end();
        //if (req.url.getParameterByName("q") === null) {
        //    resp.writeHead(400, {
        //        "Content-Type": "text/html"
        //    });
        //    resp.end("<form onsubmit='./' method='get'><input type='text' name='q' placeholder='thing to solve'><input type='submit'></form>");
        //    return;
        //}

        //resp.writeHead(200, {
        //    "Content-Type": "application/json"
        //});
        //console.log("Command sent: " + req.url.getParameterByName("q"));
        //try {
        //    var out = eval(req.url.getParameterByName("q"));
        //    resp.end(util.inspect(out, false, null));
        //} catch (e) {
        //    resp.end(e.stack);
        //}
        return;
    }

    var local = __dirname + "/public" + url;
    local = local.replaceAll("/", "\\");
    console.log(local);
    if (fs.existsSync(local)) {
        if (fs.lstatSync(local).isDirectory(local)) {
            if (fs.existsSync(local + "/index.html")) {
                local += "/index.html";
                resp.writeHead(200, {
                    "Content-Type": mime.lookup(local)
                });
                fs.readFile(local, function (err, data) {
                    if (err) {
                        resp.writeHead(500, {
                            "Content-Type": "text/plain"
                        });
                        resp.end("Internal server error");
                        throw err;
                    }
                    switch (mime.lookup(local)) {
                        case "text/plain":
                        case "text/html":
                            data = PRESEND(data);
                    }
                    resp.end(data);
                });
            } else {
                server.status_code = 403;
                resp.writeHead(403, {
                    "Content-Type": "text/plain"
                });
                resp.end("GET 403 " + http.STATUS_CODES[403] + " " + url + "\nThat Directory has no Index");
                console.log("GET 403 " + http.STATUS_CODES[403] + " " + url);
            }
        } else {
            resp.writeHead(200, {
                "Content-Type": mime.lookup(local)
            });
            fs.readFile(local, function (err, data) {
                if (err) {
                    resp.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    resp.end("Internal server error");
                    throw err;
                }
                resp.end(data);
            });
        }
    } else {
        server.status_code = 404;
        resp.writeHead(404, {
            "Content-Type": "text/plain"
        });
        resp.end("GET 404 " + http.STATUS_CODES[404] + " " + url + "\nThat File Cannot be found");
        console.log("GET 404 " + http.STATUS_CODES[404] + " " + url);
    }
});

function PRESEND(text) {
    text = text.toString();
    text = text.replaceAll("{GUILDCOUNT}", client.guilds.map(g => g.name));
    text = text.replaceAll("{PFP}", `<img src='${client.user.avatarURL}'>`);
    return text;
}

function listen(port) {
    //Don't need try/catch here as this is an asynchronous call
    server.listen(port, null, function (error) {
        if (error) {
            console.error("Unable to listen on port", port, error);
            listen(port + 1);
            return;
        }
        //spawn("open", ["http://localhost:" + port + "/"]);
    });
    return server;
}

//
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
String.prototype.getParameterByName = function (name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(this);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};
//

module.exports.listen = listen;
module.exports.setClient = function (c) {
    client = c;
};
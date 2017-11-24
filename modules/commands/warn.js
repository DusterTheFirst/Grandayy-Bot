let Enmap = require('enmap');
let Mechan = require('mechan.js');
let Client = Mechan.Discord.Client;
let Guild = Mechan.Discord.Guild;
let Message = Mechan.Discord.Message;
let Handler = Mechan.CommandHandler;
let Context = Mechan.CommandContext;

/**
 * @typedef Warning
 * @prop {Date} date Date of the warn
 * @prop {String} reason Reason for the warn
 * @prop {String} warned Person who warned
 */

/**
 * Function to run on the Initialisation of the command
 * @param {Handler} handler 
 * @param {Enmap} database 
 * @param {Client} client 
 */
module.exports = (handler, database, client) => {
    handler.createCommand('resetwarndb')
        .setCategory('Dad Commands')
        .addCheck((context) => context.user.id === '168827261682843648')
        .setDescription('Reset the database for warnings')
        .hide()
        .setCallback((context) => {
            context.channel.send('u sure?');
            /**
             * @param {Message} message 
             */
            let listenforresp = (message) => {
                if (message.author.id === context.user.id) {
                    if (message.content.toLowerCase() === "yes") {
                        database.set('warnings', {});
                        context.channel.send('k, did');
                    } else {
                        context.channel.send('i wont then');
                    }
                    client.removeListener('message', listenforresp);
                }
            }
            client.on('message', listenforresp)
        });

    handler.createCommand('warn')
        .setCategory('Warning Commands')
        .addCheck(isMod)
        .addParameter('member', Mechan.ParameterType.Required)
        .addParameter('reason', Mechan.ParameterType.Unparsed)
        .setDescription('Warn the given member')
        .setCallback((context) => {
            let member = getGuildMember(context.args[0], context.guild);
            if (!member) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: ${context.args[0]} Does not exist in this server`)
                                        .setDescription(`Use \`rb.forcewarn <id> [reason...]\` to force a warn using the user's ID (Use for users who left the server)`));
                return;
            }

            /**
             * @type {{[x: string]: {[x: string]: Warning[]}}}
             */
            let currentwarns = database.get('warnings');

            if (!currentwarns[context.guild.id])
                currentwarns[context.guild.id] = {};

            if (!currentwarns[context.guild.id][member.id])
                currentwarns[context.guild.id][member.id] = []

            let warnsforuser = currentwarns[context.guild.id][member.id];

            warnsforuser.push({
                date: new Date(Date.now()).toISOString(),
                warned: context.user.id,
                reason: context.args[1]
            });

            context.channel.send(new Mechan.Discord.RichEmbed()
                                    .setColor("#43b581")
                                    .setTitle(`Successfully warned ${member.user.tag}`)
                                    .setDescription(`${member.user.tag} now has ${warnsforuser.length} warning${warnsforuser.length != 1 ? "s" : ""}, check them with \`rb.listwarns ${member.user.id}\``));

            database.set('warnings', currentwarns);
        });

    handler.createCommand('forcewarn')
        .setCategory('Warning Commands')
        .addCheck(isMod)
        .addParameter('id', Mechan.ParameterType.Required)
        .addParameter('reason', Mechan.ParameterType.Unparsed)
        .setDescription('Force-Warn the given ID')
        .setCallback((context) => {
            for (var i = 0; i < context.args[0].length; i++) {
                if(isNaN(context.args[0][i])) {
                    context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: '${context.args[0]}' is not a valid ID`));
                    return;
                }
            }

            /**
             * @type {{[x: string]: {[x: string]: Warning[]}}}
             */
            let currentwarns = database.get('warnings');

            if (typeof currentwarns !== typeof {})
                currentwarns = {};

            if (!currentwarns[context.guild.id])
                currentwarns[context.guild.id] = {};

            if (!currentwarns[context.guild.id][context.args[0]])
                currentwarns[context.guild.id][context.args[0]] = []

            let warnsforuser = currentwarns[context.guild.id][context.args[0]];

            warnsforuser.push({
                date: new Date(Date.now()).toISOString(),
                warned: context.user.id,
                reason: context.args[1]
            });

            context.channel.send(new Mechan.Discord.RichEmbed()
                                    .setColor("#43b581")
                                    .setTitle(`Successfully warned ${context.args[0]}`)
                                    .setDescription(`${context.args[0]} now has ${warnsforuser.length} warning${warnsforuser.length > 1 ? "s" : ""}, check them with \`rb.forcelistwarns ${context.args[0]}\``));

            database.set('warnings', currentwarns);
        });

    handler.createCommand('listwarns')
        .setCategory('Warning Commands')
        .addCheck(isMod)
        .addParameter('member', Mechan.ParameterType.Required)
        .setDescription('Get the warnings for the given member')
        .setCallback((context) => {
            let member = getGuildMember(context.args[0], context.guild);
            if (!member) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: ${context.args[0]} Does not exist in this server`)
                                        .setDescription(`Use \`rb.forcelistwarns <id>\` to list the warnings from a user who left the server`));
                return;
            }

            /**
             * @type {{[x: string]: {[x: string]: Warning[]}}}
             */
            let currentwarns = database.get('warnings');

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            if (!currentwarns[context.guild.id][member.id]) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: ${member.user.tag} has no warnings`));
                return;
            }

            let warnsforuser = currentwarns[context.guild.id][member.id];

            let output = new Mechan.Discord.RichEmbed()
                            .setColor("#43b581")
                            .setTitle(`Warnings for ${member.user.tag}`)
                            .setDescription(`${member.user.tag} has ${warnsforuser.length} warning${warnsforuser.length != 1 ? "s" : ""}`);

            for (let warn of warnsforuser) {
                if (!warn) continue;
                let warned = context.guild.members.find('id', warn.warned);
                output.addField(warn.reason !== '' ? warn.reason : "No reason", `${new Date(warn.date).toUTCString()} - ${warned && warned.user.tag || warn.warned}`);
            }

            context.channel.send(output);
        });

    handler.createCommand('forcelistwarns')
        .setCategory('Warning Commands')
        .addCheck(isMod)
        .addParameter('id', Mechan.ParameterType.Required)
        .setDescription('Force-Get the warnings for the given ID')
        .setCallback((context) => {
            for (var i = 0; i < context.args[0].length; i++) {
                if(isNaN(context.args[0][i])) {
                    context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: '${context.args[0]}' is not a valid ID`));
                    return;
                }
            }

            /**
             * @type {{[x: string]: {[x: string]: Warning[]}}}
             */
            let currentwarns = database.get('warnings');

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            if (!currentwarns[context.guild.id][context.args[0]]) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: ${context.args[0]} has no warnings`));
                return;
            }

            let warnsforuser = currentwarns[context.guild.id][context.args[0]];

            let output = new Mechan.Discord.RichEmbed()
                            .setColor("#43b581")
                            .setTitle(`Warnings for ${context.args[0]}`)
                            .setDescription(`${context.args[0]} has ${warnsforuser.length} warning${warnsforuser.length != 1 ? "s" : ""}`);

            for (let warn of warnsforuser) {
                if (!warn) continue;
                let warned = context.guild.members.find('id', warn.warned);
                output.addField(warn.reason !== '' ? warn.reason : "No reason", `${new Date(warn.date).toUTCString()} - ${warned && warned.user.tag || warn.warned}`);
            }

            context.channel.send(output);
        });

    handler.createCommand('listallwarns')
        .setCategory('Warning Commands')
        .addCheck(isMod)
        .addParameter('u sure bro?', Mechan.ParameterType.Unparsed)
        .setDescription('List **EVERY SINGLE WARNING**')
        .setCallback((context) => {
            let conf = "yah i know what i am doing and i know i will cause a giant text wall when i run this command and i am in a channel where people will not get mad when i do this";

            if (context.args[0].toLowerCase() !== conf) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor("#43b581")
                                        .setTitle(`VERIFY YOU ARE LEGIT BY WRITING THE FOLLOWING OUT EXACTLY`)
                                        .setDescription(`rb.listallwarns ***${conf}***`));
                return;
            }

            /**
             * @type {{[x: string]: {[x: string]: Warning[]}}}
             */
            let currentwarns = database.get('warnings');

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            for (let id in currentwarns[context.guild.id]) {
                let warnsforuser = currentwarns[context.guild.id][id];
                if (!warnsforuser) continue;
                let member = context.guild.members.find('id', id);
                
                let output = new Mechan.Discord.RichEmbed()
                                .setColor("#43b581")
                                .setTitle(`Warnings for ${member && member.user.tag || id}`)
                                .setDescription(`${member && member.user.tag || id} has ${warnsforuser.length} warning${warnsforuser.length != 1 ? "s" : ""}`);
    
                for (let warn of warnsforuser) {
                    if (!warn) continue;
                    let warned = context.guild.members.find('id', warn.warned);
                    output.addField(warn.reason !== '' ? warn.reason : "No reason", `${new Date(warn.date).toUTCString()} - ${warned && warned.user.tag || warn.warned}`);
                }
    
                context.channel.send(output);
            }
        });

    handler.createCommand('delwarn')
        .setCategory('Warning Commands')
        .addCheck(isMod)
        .addParameter('member', Mechan.ParameterType.Required)
        .addParameter('index', Mechan.ParameterType.Unparsed)
        .setDescription('Remove the warning from the given member')
        .setCallback((context) => {
            let member = getGuildMember(context.args[0], context.guild);
            if (!member) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: ${context.args[0]} Does not exist in this server`)
                                        .setDescription(`Use \`rb.forcedelwarn <id> <index>\` to force delete a warn using the user's ID`));
                return;
            }

            if (isNaN(context.args[1]) || context.args[1] === '') {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                .setColor('#f04747')
                                .setTitle(`:x: '${context.args[1]}' Is not a valid number`));
                return;
            }

            /**
             * @type {{[x: string]: {[x: string]: Warning[]}}}
             */
            let currentwarns = database.get('warnings');

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            if (!currentwarns[context.guild.id][member.id]) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                        .setColor('#f04747')
                                        .setTitle(`:x: ${member.user.tag} has no warnings`));
                return;
            }

            let warnsforuser = currentwarns[context.guild.id][member.id];

            if (parseInt(context.args[1]) > warnsforuser.length || parseInt(context.args[1]) < 1) {
                context.channel.send(new Mechan.Discord.RichEmbed()
                                .setColor('#f04747')
                                .setTitle(`:x: '${context.args[1]}' Is not between 1 and ${warnsforuser.length}`));
                return;
            }

            warnsforuser.splice(parseInt(context.args[1]) - 1, 1);

            if (warnsforuser.length == 0)
                currentwarns[context.guild.id][member.id] = undefined;

            context.channel.send(new Mechan.Discord.RichEmbed()
                                    .setColor("#43b581")
                                    .setTitle(`Successfully removed warning ${context.args[1]} from ${member.user.tag}`)
                                    .setDescription(`${member.user.tag} now has ${warnsforuser && warnsforuser.length || 0} warning${warnsforuser && warnsforuser.length || 100 != 1 ? "s" : ""}, check them with \`rb.listwarns ${member.user.id}\``));

            database.set('warnings', currentwarns);
        });
        //FORCE DEL WARN
        //ADD TO WEBHOKTHING
}

/**
 * Checks if the member is a moderator
 * @param {Context} context 
 */
function isMod(context) {
    return context.message.member.hasPermission('KICK_MEMBERS');
}

/**
 * Get a guild member from the given guild
 * @param {String} x Identifter
 * @param {Guild} guild 
 */
function getGuildMember(x, guild) {
    let mems = guild.members;
    return mems.get(x)
        || mems.find(m =>
                m.user.username.toLowerCase() === x.toLowerCase()
            || m.displayName.toLowerCase() === x.toLowerCase()
            || m.user.tag.toLowerCase() === x.toLowerCase()
            || m.id.toLowerCase() === x.toLowerCase()
            || m.toString().toLowerCase() === x.toLowerCase())
        || null;
}
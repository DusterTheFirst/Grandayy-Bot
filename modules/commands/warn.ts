import { CommandHandler, ParameterType, CommandContext } from "mechan.js";
import { Collection, Client, RichEmbed, Message, Guild } from "discord.js";

interface Warning {
    /** Date of the warn */
    date: Date;
    /** Reason for the warn */
    reason: String;
    /** Person who warned  */
    warned: String;
}

/*
/// USE COLLECTIONS NOT LISTS
module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createCommand("resetwarndb")
        .setCategory("Dad Commands")
        .addCheck((context) => context.user.id === "168827261682843648")
        .setDescription("Reset the database for warnings")
        .hide()
        .setCallback((context) => {
            context.channel.send("u sure?");
            let listenforresp = (message: Message) => {
                if (message.author.id === context.user.id) {
                    if (message.content.toLowerCase() === "yes") {
                        database.collection("warnings").deleteMany({}).then(() => {
                            context.channel.send("k, did");
                        }).catch((reason) => {
                            context.channel.send("couldn\"t do it dad ;-;");
                            console.error(reason);
                        });
                    } else {
                        context.channel.send("i wont then");
                    }
                    client.removeListener("message", listenforresp);
                }
            }
            client.on("message", listenforresp)
        });

    handler.createCommand("warn")
        .setCategory("Warning Commands")
        .addCheck(isMod)
        .addParameter("member", ParameterType.Required)
        .addParameter("reason", ParameterType.Unparsed)
        .setDescription("Warn the given member")
        .setCallback((context) => {
            let member = getGuildMember(context.params.get("member"), context.guild);
            if (!member) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: ${context.params.get("member")} Does not exist in this server`)
                                        .setDescription(`Use \`rb.forcewarn <id> [reason...]\` to force a warn using the user's ID (Use for users who left the server)`));
                return;
            }

            let currentwarns = database.get("warnings");

            if (!currentwarns[context.guild.id])
                currentwarns[context.guild.id] = {};

            if (!currentwarns[context.guild.id][member.id])
                currentwarns[context.guild.id][member.id] = []

            let warnsforuser = currentwarns[context.guild.id][member.id];

            warnsforuser.push({
                date: new Date(Date.now()).toISOString(),
                warned: context.user.id,
                reason: context.params.get("reason")
            });

            context.channel.send(new RichEmbed()
                                    .setColor("#43b581")
                                    .setTitle(`Successfully warned ${member.user.tag}`)
                                    .setDescription(`${member.user.tag} now has ${warnsforuser.length} warning${warnsforuser.length != 1 ? "s" : ""}, check them with \`rb.listwarns ${member.user.id}\``));

            database.set("warnings", currentwarns);
        });

    handler.createCommand("forcewarn")
        .setCategory("Warning Commands")
        .addCheck(isMod)
        .addParameter("id", ParameterType.Required)
        .addParameter("reason", ParameterType.Unparsed)
        .setDescription("Force-Warn the given ID")
        .setCallback((context) => {
            for (var i = 0; i < context.params.get("id").length; i++) {
                if(isNaN(context.params.get("id")[i] as any)) {
                    context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: "${context.params.get("id")}" is not a valid ID`));
                    return;
                }
            }

            let currentwarns = database.get("warnings");

            if (typeof currentwarns !== typeof {})
                currentwarns = {};

            if (!currentwarns[context.guild.id])
                currentwarns[context.guild.id] = {};

            if (!currentwarns[context.guild.id][context.params.get("id")])
                currentwarns[context.guild.id][context.params.get("id")] = []

            let warnsforuser = currentwarns[context.guild.id][context.params.get("id")];

            warnsforuser.push({
                date: new Date(Date.now()).toISOString(),
                warned: context.user.id,
                reason: context.params.get("reason")
            });

            context.channel.send(new RichEmbed()
                                    .setColor("#43b581")
                                    .setTitle(`Successfully warned ${context.params.get("reason")}`)
                                    .setDescription(`${context.params.get("reason")} now has ${warnsforuser.length} warning${warnsforuser.length > 1 ? "s" : ""}, check them with \`rb.forcelistwarns ${context.params.get("reason")}\``));

            database.set("warnings", currentwarns);
        });

    handler.createCommand("listwarns")
        .setCategory("Warning Commands")
        .addCheck(isMod)
        .addParameter("member", ParameterType.Required)
        .setDescription("Get the warnings for the given member")
        .setCallback((context) => {
            let member = getGuildMember(context.params.get("member"), context.guild);
            if (!member) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: ${context.params.get("member")} Does not exist in this server`)
                                        .setDescription(`Use \`rb.forcelistwarns <id>\` to list the warnings from a user who left the server`));
                return;
            }

            let currentwarns = database.get("warnings");

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            if (!currentwarns[context.guild.id][member.id]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: ${member.user.tag} has no warnings`));
                return;
            }

            let warnsforuser = currentwarns[context.guild.id][member.id];

            let output = new RichEmbed()
                            .setColor("#43b581")
                            .setTitle(`Warnings for ${member.user.tag}`)
                            .setDescription(`${member.user.tag} has ${warnsforuser.length} warning${warnsforuser.length != 1 ? "s" : ""}`);

            for (let warn of warnsforuser) {
                if (!warn) continue;
                let warned = context.guild.members.find("id", warn.warned);
                output.addField(warn.reason !== "" ? warn.reason : "No reason", `${new Date(warn.date).toUTCString()} - ${warned && warned.user.tag || warn.warned}`);
            }

            context.channel.send(output);
        });

    handler.createCommand("forcelistwarns")
        .setCategory("Warning Commands")
        .addCheck(isMod)
        .addParameter("id", ParameterType.Required)
        .setDescription("Force-Get the warnings for the given ID")
        .setCallback((context) => {
            for (var i = 0; i < context.params.get("id").length; i++) {
                if(isNaN(context.params.get("id")[i] as any)) {
                    context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: "${context.params.get("id")}" is not a valid ID`));
                    return;
                }
            }

            let currentwarns = database.get("warnings");

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            if (!currentwarns[context.guild.id][context.params.get("id")]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: ${context.params.get("id")} has no warnings`));
                return;
            }

            let warnsforuser = currentwarns[context.guild.id][context.params.get("id")];

            let output = new RichEmbed()
                            .setColor("#43b581")
                            .setTitle(`Warnings for ${context.params.get("id")}`)
                            .setDescription(`${context.params.get("id")} has ${warnsforuser.length} warning${warnsforuser.length != 1 ? "s" : ""}`);

            for (let warn of warnsforuser) {
                if (!warn) continue;
                let warned = context.guild.members.find("id", warn.warned);
                output.addField(warn.reason !== "" ? warn.reason : "No reason", `${new Date(warn.date).toUTCString()} - ${warned && warned.user.tag || warn.warned}`);
            }

            context.channel.send(output);
        });

    handler.createCommand("listallwarns")
        .setCategory("Warning Commands")
        .addCheck(isMod)
        .addParameter("u sure bro?", ParameterType.Unparsed)
        .setDescription("List **EVERY SINGLE WARNING**")
        .setCallback((context) => {
            let conf = "yah i know what i am doing and i know i will cause a giant text wall when i run this command and i am in a channel where people will not get mad when i do this";

            if (context.params.get("u sure bro?").toLowerCase() !== conf) {
                context.channel.send(new RichEmbed()
                                        .setColor("#43b581")
                                        .setTitle(`VERIFY YOU ARE LEGIT BY WRITING THE FOLLOWING OUT EXACTLY`)
                                        .setDescription(`rb.listallwarns ***${conf}***`));
                return;
            }

            let currentwarns = database.get("warnings");

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            for (let id in currentwarns[context.guild.id]) {
                let warnsforuser = currentwarns[context.guild.id][id];
                if (!warnsforuser) continue;
                let member = context.guild.members.find("id", id);
                
                let output = new RichEmbed()
                                .setColor("#43b581")
                                .setTitle(`Warnings for ${member && member.user.tag || id}`)
                                .setDescription(`${member && member.user.tag || id} has ${warnsforuser.length} warning${warnsforuser.length != 1 ? "s" : ""}`);
    
                for (let warn of warnsforuser) {
                    if (!warn) continue;
                    let warned = context.guild.members.find("id", warn.warned);
                    output.addField(warn.reason !== "" ? warn.reason : "No reason", `${new Date(warn.date).toUTCString()} - ${warned && warned.user.tag || warn.warned}`);
                }
    
                context.channel.send(output);
            }
        });

    handler.createCommand("delwarn")
        .setCategory("Warning Commands")
        .addCheck(isMod)
        .addParameter("member", ParameterType.Required)
        .addParameter("index", ParameterType.Optional)
        .setDescription("Remove the warning from the given member")
        .setCallback((context) => {
            let member = getGuildMember(context.params.get("member"), context.guild);
            if (!member) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: ${context.params.get("member")} Does not exist in this server`)
                                        .setDescription(`Use \`rb.forcedelwarn <id> <index>\` to force delete a warn using the user's ID`));
                return;
            }

            if (isNaN(context.params.get("index")) || !context.params.get("index")) {
                context.channel.send(new RichEmbed()
                                .setColor("#f04747")
                                .setTitle(`:x: "${context.params.get("index")}" Is not a valid number`));
                return;
            }

            let currentwarns = database.get("warnings");

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            if (!currentwarns[context.guild.id][member.id]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: ${member.user.tag} has no warnings`));
                return;
            }

            let warnsforuser = currentwarns[context.guild.id][member.id];

            if (parseInt(context.params.get("index")) > warnsforuser.length || parseInt(context.params.get("index")) < 1) {
                context.channel.send(new RichEmbed()
                                .setColor("#f04747")
                                .setTitle(`:x: "${context.params.get("index")}" Is not between 1 and ${warnsforuser.length}`));
                return;
            }

            warnsforuser.splice(parseInt(context.params.get("index")) - 1, 1);

            if (warnsforuser.length == 0)
                delete currentwarns[context.guild.id][member.id];

            context.channel.send(new RichEmbed()
                                    .setColor("#43b581")
                                    .setTitle(`Successfully removed warning ${context.params.get("index")} from ${member.user.tag}`)
                                    .setDescription(`${member.user.tag} now has ${warnsforuser && warnsforuser.length || 0} warning${warnsforuser && warnsforuser.length || true ? "s" : ""}, check them with \`rb.listwarns ${member.user.id}\``));

            database.set("warnings", currentwarns);
        });
    handler.createCommand("forcedelwarn")
        .setCategory("Warning Commands")
        .addCheck(isMod)
        .addParameter("member", ParameterType.Required)
        .addParameter("index", ParameterType.Optional)
        .setDescription("Remove the warning from the given ID")
        .setCallback((context) => {
            if (isNaN(context.params.get("index")) || !context.params.get("index")) {
                context.channel.send(new RichEmbed()
                                .setColor("#f04747")
                                .setTitle(`:x: "${context.params.get("index")}" Is not a valid number`));
                return;
            }

            let currentwarns = database.get("warnings");

            if (!currentwarns[context.guild.id]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: This server has no warnings`));
                return;
            }

            if (!currentwarns[context.guild.id][context.params.get("member")]) {
                context.channel.send(new RichEmbed()
                                        .setColor("#f04747")
                                        .setTitle(`:x: ${context.params.get("member")} has no warnings`));
                return;
            }

            let warnsforuser = currentwarns[context.guild.id][context.params.get("member")];

            if (parseInt(context.params.get("index")) > warnsforuser.length || parseInt(context.params.get("index")) < 1) {
                context.channel.send(new RichEmbed()
                                .setColor("#f04747")
                                .setTitle(`:x: "${context.params.get("index")}" Is not between 1 and ${warnsforuser.length}`));
                return;
            }

            warnsforuser.splice(parseInt(context.params.get("index")) - 1, 1);

            if (warnsforuser.length == 0)
                delete currentwarns[context.guild.id][context.params.get("member")];

            context.channel.send(new RichEmbed()
                                    .setColor("#43b581")
                                    .setTitle(`Successfully removed warning ${context.params.get("member")} from ${context.params.get("member")}`)
                                    .setDescription(`${context.params.get("member")} now has ${warnsforuser && warnsforuser.length || 0} warning${warnsforuser && warnsforuser.length || true ? "s" : ""}, check them with \`rb.listwarns ${context.params.get("member")}\``));

            database.set("warnings", currentwarns);
        });
        //ADD TO WEBHOKTHING
}
*/

/**
 * Checks if the member is a moderator
 */
function isMod(context: CommandContext) {
    return context.message.member.hasPermission("KICK_MEMBERS");
}

/**
 * Get a guild member from the given guild
 */
function getGuildMember(x: string, guild: Guild) {
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
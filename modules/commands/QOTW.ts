import { CommandHandler, ParameterType, CommandContext } from "mechan.js";
import { Collection, Client, TextChannel, RichEmbed, Message, ReactionCollector, MessageReaction, Guild, RichEmbedOptions, MessageEmbed } from "discord.js";
import { Database } from "sqlite";
import humanize = require("humanize-duration");

let config: Config;

module.exports = (handler: CommandHandler, database: Database, client: Client, cfg: Config) => {
    config = cfg;

    let QOTWChannel = client.channels.get(config.QOTWsubmissions) as TextChannel;


    handler.createGroup("qotw", (qotw) => {
        qotw.setCategory("Question Of The Day");

        qotw.createCommand("reset")
            .setCategory("Dad Commands")
            .addCheck((context) => context.user.id === "168827261682843648")
            .setDescription("Reset the database")
            .hide()
            .setCallback((context) => {
                context.channel.send("u sure?");
                let listenforresp = (message: Message) => {
                    if (message.author.id === context.user.id) {
                        if (message.content.toLowerCase() === "yes") {
                            database.run("DROP TABLE qotwpropositions", () => {
                                database.run("DROP TABLE qotwlimits", () => {
                                    database.run("DROP TABLE qotwqueue", () => {
                                        context.channel.send("k, did");
                                    });
                                });
                            });
                        } else {
                            context.channel.send("i won't then");
                        }
                        client.removeListener("message", listenforresp);
                    }
                };
                client.on("message", listenforresp);
            });

        qotw.createCommand("propose")
            .addParameter("question", ParameterType.Unparsed)
            .setDescription("Propose a QOTW")
            .setCallback(async (context) => {
                if (context.user.id === "168827261682843648") {
                    propose(context);
                    return;
                }

                await database.run("CREATE TABLE IF NOT EXISTS qotwlimits (lastproposition INTEGER, user TEXT)");

                let limit: PropisitionLimit = await database.get(`SELECT * FROM qotwlimits WHERE user = ?`, context.user.id);

                if (!limit) {
                    database.run(`INSERT INTO qotwlimits VALUES (?, ?)`, [Date.now(), context.user.id]);
                    propose(context);
                } else {
                    let currentTime = Date.now();
                    let lastTime = limit.lastproposition;
                    let difference = currentTime - lastTime;
                    let delay = 1.728e+8;
                    let timeLeft = -((difference) - delay);

                    if (timeLeft < 0) {
                        database.run(`UPDATE qotwlimits SET lastproposition = ? WHERE user = ?`, [Date.now(), context.user.id]);
                        propose(context);
                    } else {
                        context.channel.send(`You must wait **${humanize(timeLeft, { conjunction: " and ", round: true })}** before submitting another proposal`);
                    }
                }
            });

        qotw.createCommand("vote")
            .addParameter("user", ParameterType.Required)
            .addParameter("vote", ParameterType.Required)
            .setDescription("Set your vote on a QOTW (yes|no|abstain)")
            .addCheck(isStaff)
            .setCallback(async (context) => {
                let member = getGuildMember(context.params.get("user"), context.guild);
                if (!member) {
                    context.channel.send(`Could not find user: *"${context.params.get("user")}"*`);
                    return;
                }
                let vote: "a" | "n" | "y";
                switch (context.params.get("vote")) {
                    case "yes": case "y":
                        vote = "y"; break;
                    case "no": case "n":
                        vote = "n"; break;
                    case "abstain": case "a":
                        vote = "a"; break;
                    default:
                        context.channel.send(`Invalid vote "**${context.params.get("vote")}**"`); return;
                }

                let propsition: Propisition = await database.get(`SELECT * FROM qotwpropositions WHERE proposer = ?`, member.user.id);

                if (propsition) {
                    let voted: "a" | "n" | "y";
                    let yess = getArrayfromString(propsition.y);
                    let nos = getArrayfromString(propsition.n);
                    let abstains = getArrayfromString(propsition.a);

                    if (yess.includes(context.member.id)) {
                        voted = "y";
                    } else if (nos.includes(context.member.id)) {
                        voted = "n";
                    } else if (abstains.includes(context.member.id)) {
                        voted = "a";
                    }

                    removeFromArray(context.member.id, yess);
                    removeFromArray(context.member.id, nos);
                    removeFromArray(context.member.id, abstains);

                    if (vote === "y")
                        yess.push(context.member.id);
                    if (vote === "n")
                        nos.push(context.member.id);
                    if (vote === "a")
                        abstains.push(context.member.id);

                    await database.run(`UPDATE qotwpropositions SET y = ?, n = ?, a = ? WHERE proposer = ?`, yess.join(","), nos.join(","), abstains.join(","), member.user.id);
                    update(await database.get(`SELECT * FROM qotwpropositions WHERE proposer = ?`, member.user.id));

                    if (voted === vote) {
                        context.channel.send(`You already voted **${getLongVote(vote)}** on **${member.user.tag}**'s proposal`);
                    } else if (voted) {
                        context.channel.send(`Changed vote from **${getLongVote(voted)}** to **${getLongVote(vote)}** on **${member.user.tag}**'s proposal`);
                    } else {
                        context.channel.send(`Voted **${getLongVote(vote)}** on **${member.user.tag}**'s proposal`);
                    }

                    // SEND TO STAFF CHANNEL x*4<y with y>4 TO win
                    if (nos.length + 4 <= yess.length && yess.length > 4) {
                        context.channel.send(`A THING HAPPENED`);
                        await pass(await database.get(`SELECT * FROM qotwpropositions WHERE proposer = ?`, member.user.id));
                    }
                } else {
                    context.channel.send(`**${member.user.tag}** is not proposing a QOTW`);
                }
            });

        qotw.createNestedCommand("list propositions")
                .setDescription("List all QOTW propositions")
                .setCallback(listPropositions);

        qotw.createNestedCommand("list queue")
                .setDescription("List the QOTW queue")
                .setCallback(listQueue);
    });

    function propose(context: CommandContext) {
        let question: string = context.params.get("question");

        database.run("CREATE TABLE IF NOT EXISTS qotwpropositions (proposer TEXT, proposed INTEGER, proposedMSG TEXT, question TEXT, y TEXT, n TEXT, a TEXT);", () => {
            QOTWChannel.send(new RichEmbed()
                    .setColor(config.colors.yellow)
                    .setTitle(`QOTW proposed by ${context.user.tag}`)
                    .setDescription(`**Question:** ${question}\n\n**Command: **-qotw vote ${context.user.tag}`)
                    .setFooter("Awaiting votes...")
                    .addField("Yes", 0, true)
                    .addField("No", 0, true)
                    .addField("Abstain", 0, true)
                    .setTimestamp()
                    .setThumbnail(context.user.avatarURL))
                    .then(async (m) => {
                        let message: Message;

                        message = m instanceof Array ? m[0] : m;

                        let propostion = await database.get(`SELECT * FROM qotwpropositions WHERE proposer = ?`, context.user.id);
                        if (propostion) {
                            remove(propostion);
                            database.run("DELETE FROM qotwpropositions WHERE proposer = ?", [context.user.id]);
                        }
                        await database.run(`INSERT INTO qotwpropositions VALUES (?, ?, ?, ?, ?, ?, ?)`, context.user.id, Date.now(), message.id, question, "", "", "");
                    });
        });
    }

    async function listPropositions(context: CommandContext) {
        let propositions = await database.all("SELECT * FROM qotwpropositions");
        let embed = new RichEmbed()
                        .setColor(config.colors.green);

        if (!propositions)
            embed.setDescription("No propositions");
        else for (let prop of propositions) {
            embed.addField(context.guild.member(prop.proposer).user.tag, `**${prop.question}** - ${prop.y.split(",").length}Y ${prop.n.split(",").length}N ${prop.a.split(",").length}A`);
        }

        context.channel.send(embed);
    }
    async function listQueue(context: CommandContext) {
        let queue = await database.all("SELECT * FROM qotwqueue");
        let embed = new RichEmbed()
                        .setColor(config.colors.green);

        if (!queue)
            embed.setDescription("No queue");
        else for (let prop of queue) {
            embed.addField(context.guild.member(prop.proposer).user.tag, prop.question);
        }

        context.channel.send(embed);
    }

    async function remove(proposition: Propisition) {
        let message = await QOTWChannel.fetchMessage(proposition.proposedMSG).catch(console.error);

        if (!message) return;

        let oldEmbed = cleanEmbed(message.embeds[0]);
        message.edit("", { embed: oldEmbed.setColor(config.colors.red).setFooter("CLOSED") });
        message.guild.member(proposition.proposer)
            .send("", new RichEmbed()
                    .setColor(config.colors.red)
                    .setTitle(`QOTW "${proposition.question}" was not accepted`)
                    .setDescription(`Your QOTW was not accepted, due to it not getting enough votes`)
                    .setTimestamp());
    }

    async function pass(proposition: Propisition) {
        let propostion = await database.run("CREATE TABLE IF NOT EXISTS qotwqueue (proposer TEXT, proposed INTEGER, question TEXT)");

        let message = await QOTWChannel.fetchMessage(proposition.proposedMSG).catch(console.error);

        if (!message) return;

        let oldEmbed = cleanEmbed(message.embeds[0]);
        message.edit("", { embed: oldEmbed.setColor(config.colors.green).setFooter("PASSED") });
        message.guild.member(proposition.proposer)
            .send("", new RichEmbed()
                    .setColor(config.colors.green)
                    .setTitle(`QOTW "${proposition.question}" was accepted`)
                    .setDescription(`Your QOTW was accepted, it won with ${getArrayfromString(proposition.y).length} upd00ts`)
                    .setTimestamp());
        database.run("INSERT INTO qotwqueue VALUES (?, ?, ?)", [proposition.proposer, proposition.proposed, proposition.question]);
        database.run("DELETE FROM qotwpropositions WHERE proposer = ?", [proposition.proposer]);
    }

    async function update(proposition: Propisition) {
        let message = await QOTWChannel.fetchMessage(proposition.proposedMSG).catch(console.error);

        if (!message) return;

        let oldEmbed = cleanEmbed(message.embeds[0]);
        oldEmbed.fields = [];
        oldEmbed.addField("Yes", getArrayfromString(proposition.y).length, true)
                .addField("No", getArrayfromString(proposition.n).length, true)
                .addField("Abstain", getArrayfromString(proposition.a).length, true);

        message.edit("", { embed: oldEmbed });
    }
};

function getArrayfromString(list: string): string[] {
    let array = list.split(",");
    if (array.includes("")) {
        array.splice(list.indexOf(""), 1);
    }
    return array;
}
function createStringFromArray(list: string[]): string {
    let array = list.join(",");
    return array;
}
function removeFromArray(item: string, array: string[]): string[] {
    while (array.indexOf(item) !== -1) {
        array.splice(array.indexOf(item), 1);
    }
    return array;
}

interface Propisition {
    /** ID of the proposer */
    proposer: string;
    /** When it was proposed */
    proposed: number;
    /** ID to the vote message */
    proposedMSG: string;
    /** Question proposed */
    question: string;
    /** Votes for yes */
    y: string;
    /** Votes for no */
    n: string;
    /** Votes for abstain */
    a: string;
}

interface QOTW {
    /** ID of the proposer */
    proposer: string;
    /** When it was proposed */
    proposed: number;
    /** Question proposed */
    question: string;
}

interface PropisitionLimit {
    /** ID of the user */
    user: string;
    /** When it was proposed */
    lastproposition: number;
}

/** Get the long form of a vote char */
function getLongVote(vote: "y" | "n" | "a"): string {
    switch (vote) {
        case "y":
            return "YES";
        case "n":
            return "NO";
        case "a":
            return "ABSTAIN";
    }
}

/**
 * Clean a message embed of circular references
 * @param embed - Embed to clean
 */
function cleanEmbed(embed: MessageEmbed): RichEmbed {
    return new RichEmbed({
        author: embed.author && {
            icon_url: embed.author.iconURL,
            name: embed.author.name,
            url: embed.author.url
        },
        color: embed.color,
        description: embed.description,
        fields: embed.fields.map(x => {
            return {
                name: x.name,
                value: x.value,
                inline: x.inline
            };
        }),
        file: null, // No property?
        footer: embed.footer && {
            icon_url: embed.footer.iconURL,
            text: embed.footer.text
        },
        image: embed.image && {
            height: embed.image.height,
            proxy_url: embed.image.proxyURL,
            url: embed.image.url,
            width: embed.image.width
        },
        thumbnail: embed.thumbnail && {
            height: embed.thumbnail.height,
            url: embed.thumbnail.url,
            width: embed.thumbnail.width
        },
        timestamp: new Date(embed.createdTimestamp),
        title: embed.title,
        url: embed.url,
        video: embed.video && {
            height: embed.video.height,
            width: embed.video.width,
            url: embed.video.url
        }
    });
}

/**
 * Checks if the member is in the mod server
 */
function isStaff(context: CommandContext) {
    let is = context.guild.id === "372420841943859210" && (context.member.roles.array().filter(x => x.name !== "@everyone").length > 0);

    if (!is) {
        context.channel.send(new RichEmbed().setColor(config.colors.red).attachFile("./modules/commands/res/hahaYES.png").setImage("attachment://hahaYES.png"));
    }

    return is;
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
            || m.toString().toLowerCase().replace("!", "") === x.toLowerCase().replace("!", ""))
        || null;
}
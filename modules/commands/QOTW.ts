import { CommandHandler, ParameterType, CommandContext } from "mechan.js"
import { Collection, Client, TextChannel, RichEmbed, Message, ReactionCollector, MessageReaction, Guild, RichEmbedOptions, MessageEmbed } from "discord.js";
import { Database } from "sqlite3";
import humanize = require("humanize-duration");

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createCommand('say')
        .addParameter('thing', ParameterType.Unparsed)
        .hide()
        .addCheck((context) => context.user.id === "168827261682843648")
        .setCallback((context) => {
            if (context.message.deletable) {
                context.message.delete();
            }
            context.channel.send(context.params.get('thing') as string);
        })

    //RESTART COLLECTORS
    let QOTWChannel = client.channels.get(config.QOTWsubmissions) as TextChannel

    handler.createGroup('qotw', (qotw) => {
        qotw.setCategory('Question Of The Week')

        qotw.createCommand('reset')
            .setCategory('Dad Commands')
            .addCheck((context) => context.user.id === '168827261682843648')
            .setDescription('Reset the database')
            .hide()
            .setCallback((context) => {
                context.channel.send('u sure?');
                let listenforresp = (message: Message) => {
                    if (message.author.id === context.user.id) {
                        if (message.content.toLowerCase() === "yes") {
                            database.run('DROP TABLE qotwpropositions', () => {
                                database.run('DROP TABLE qotwlimits', () => {
                                    database.run('DROP TABLE qotwqueue', () => {
                                        context.channel.send('k, did');
                                    });
                                });
                            });
                        } else {
                            context.channel.send('i wont then');
                        }
                        client.removeListener('message', listenforresp);
                    }
                }
                client.on('message', listenforresp)
            });

        qotw.createCommand('propose')
            .addParameter('question', ParameterType.Unparsed)
            .setDescription('Propose a QOTW')
            .setCallback((context) => {
                if (context.user.id === "168827261682843648") {
                    propose(context);
                    return;
                }

                database.run('CREATE TABLE IF NOT EXISTS qotwlimits (lastproposition INTEGER, user TEXT)', (error) => {
                    database.get(`SELECT * FROM qotwlimits WHERE user = ?`, [context.user.id], (error, row: PropisitionLimit) => {
                        if (!row) {
                            database.run(`INSERT INTO qotwlimits VALUES (?, ?)`, [Date.now(), context.user.id]);
                            propose(context);
                        } else {
                            let currentTime = Date.now();
                            let lastTime = row.lastproposition;
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
                });

                
            });

        qotw.createCommand('vote')
            .addParameter('user', ParameterType.Required)
            .addParameter('vote', ParameterType.Required)
            .setDescription('Set your vote on the QOTW (yes|no)')
            .addCheck(isMod)
            .setCallback((context) => {
                let member = getGuildMember(context.params.get('user'), context.guild);
                if (!member) {
                    context.channel.send(`Could not find user: *'${context.params.get('user')}'*`);
                    return;
                }
                let vote: 'a' | 'n' | 'y';
                database.get(`SELECT * FROM qotwpropositions WHERE proposer = ?`, [member.user.id], (error, row: Propisition) => {
                    if (row) {
                        database.run(`UPDATE qotwlimits SET ? = ? WHERE proposer = ?`, [vote, row[vote], member.user.id]);
                        context.channel.send(`did your thing`);
                    } else {
                        context.channel.send(`that boye has no QOTW`);
                    }
                    context.channel.send(`No one cares that you voted ${context.params.get('vote')} for ${member.user.tag}`);
                });
                //SEND TO STAFF CHANNEL x<y/4 with y>4 TO win
            });

        qotw.createNestedCommand('list propositions')
                .setDescription('List all QOTW propositions')
                .setCallback(listPropositions);

        qotw.createNestedCommand('list queue')
                .setDescription('List the QOTW queue')
                .setCallback(listQueue);
    })

    function propose(context: CommandContext) {
        let question: string = context.params.get('question');
        
        let channel = client.channels.get(config.QOTWsubmissions) as TextChannel;

        database.run("CREATE TABLE IF NOT EXISTS qotwpropositions (proposer TEXT, proposed INTEGER, proposedMSG TEXT, question TEXT, y BLOB, n BLOB, a BLOB);", () => {    
            channel.send(new RichEmbed()
                    // .setColor("#43b581") YES
                    // .setColor("#f04747") NO
                    .setColor("#faa61a")
                    .setTitle(`QOTW proposed by ${context.user.tag}`)
                    .setDescription(`**Question:** ${question}\n\n**Command: **-qotw vote ${context.user.tag} [yes|no]`)
                    .setFooter('Awaiting votes...')
                    .setTimestamp()
                    .setThumbnail(context.user.avatarURL))
                    .then((m) => {
                        let message: Message;
    
                        if (m instanceof Array) {
                            message = m[0];
                        } else {
                            message = m;
                        }

                        console.log(message, m)

                        database.get(`SELECT * FROM qotwpropositions WHERE proposer = ?`, [context.user.id], (error, row: Propisition) => {
                            console.log(message, m)
                            if (row) {
                                remove(row);
                                database.run('DELETE FROM qotwpropositions WHERE proposer = ?', [context.user.id]);
                            }
                            database.run(`INSERT INTO qotwpropositions VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [context.user.id, Date.now(), message.id, question, [], [], []]);
                        });
                        //database.all("SELECT * FROM qotwpropositions", console.log);
                    });
        });
    }

    function listPropositions(context: CommandContext) {
        database.all('SELECT * FROM qotwpropositions', (error, rows: Propisition[]) => {
            //context.channel.send('```json\n' + (JSON.stringify(rows.map(x => x.question), undefined, 2) || '[]') + '\n```');
            let embed = new RichEmbed()
                            .setColor('#43b581');

            if (!rows)
                embed.setDescription('No propositions');
            else for (let prop of rows) {
                embed.addField(context.guild.member(prop.proposer).user.tag, prop.question);
            }
            
            context.channel.send(embed);
        });
    }
    function listQueue(context: CommandContext) {
        database.all('SELECT * FROM qotwqueue', (error, rows: QOTW[]) => {
            //context.channel.send('```json\n' + (JSON.stringify(rows.map(x => x.question), undefined, 2) || '[]') + '\n```');
            let embed = new RichEmbed()
                            .setColor('#43b581');

            if (!rows)
                embed.setDescription('No queue');
            else for (let prop of rows) {
                embed.addField(context.guild.member(prop.proposer).user.tag, prop.question);
            }
            
            context.channel.send(embed);
        });
    }

    function remove(proposition: Propisition) {
        QOTWChannel.fetchMessage(proposition.proposedMSG).then((message) => {
            let oldEmbed = cleanEmbed(message.embeds[0]);
            message.edit('', { embed: oldEmbed.setColor("#43b581").setFooter('CLOSED') });
            message.guild.member(proposition.proposer)
                .send('', new RichEmbed()
                        .setColor("#43b581")
                        .setTitle(`QOTW "${proposition.question}" was not accepted`)
                        .setDescription(`Your QOTW was not accepted, due to it not getting enough votes`)
                        .setTimestamp());
        }).catch(console.error);
    }

    function pass(proposition: Propisition) {
        database.run('CREATE TABLE IF NOT EXISTS qotwqueue (proposer TEXT, proposed INTEGER, question TEXT)', (error) => {
            QOTWChannel.fetchMessage(proposition.proposedMSG).then((message) => {
                let oldEmbed = cleanEmbed(message.embeds[0]);
                message.edit('', { embed: oldEmbed.setColor("#f04747").setFooter('PASSED') });
                message.guild.member(proposition.proposer)
                    .send('', new RichEmbed()
                            .setColor("#f04747")
                            .setTitle(`QOTW "${proposition.question}" not accepted`)
                            .setDescription(`Your QOTW was not accepted, it won with ${proposition.y} up d00ts`)
                            .setTimestamp());
                database.run("INSERT INTO qotwqueue VALUES (?, ?, ?)", [proposition.proposer, proposition.proposed, proposition.question]);
            }).catch(console.error);
        });
    }
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
    y: string[];
    /** Votes for no */
    n: string[];
    /** Votes for abstain */
    a: string[];
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
            }
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
 * Checks if the member is a moderator
 */
function isMod(context: CommandContext) {
    return context.message.member.hasPermission('KICK_MEMBERS');
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
            || m.toString().toLowerCase().replace('!', '') === x.toLowerCase().replace('!', ''))
        || null;
}
import { Guild, GuildMember, Role } from "discord.js";

export class WebUtil {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public error(error: string, body: string) {
        return `<h1>${error}</h1>${body}<br><hr><center>Robbie Botten</center>`;
    }
    public url(url: string) {
        return `<a href="${url}">${url}</a>`;
    }


    public trimRole(role: Role) {
        if (!role)
            return {
                id:         null,
                color:      null,
                hexColor:   null,
                name:       null,
                hoist:      null
            };

        return {
            id:         role.id,
            color:      role.color,
            hexColor:   role.hexColor,
            name:       role.name,
            hoist:      role.hoist
        };
    }

    public trimMember(member: GuildMember) {
        if (!member)
            return {
                tag:            null,
                discriminator:  null,
                username:       null,
                nickname:       null,
                displayName:    null,
                id:             null,
                presence:       null,
                color:          null,
                colorHex:       null,
                avatar:         null,
                roles:          null,
                highestRole:    null,
                hoistRole:      null,
                joined:         null,
                created:        null,
                bot:            null,
                level:          null,
                levelColor:     null,
                statuses:       null,
                displayStatus:  null
            };

        let userLevel = "0";
        let levelColor = undefined;
        for (let level of Object.keys(this.config.levels).reverse()) {
            if (member.roles.array().map(x => x.id).includes(this.config.levels[level])) {
                userLevel = level;
                levelColor = member.roles.find(x => x.id === this.config.levels[level]).hexColor;
                break;
            }
        }
        let userStatus = [];
        let topStatus;
        for (let status in this.config.statuses) {
            for (let statusrole of this.config.statuses[status]) {
                if (member.roles.array().map(x => x.id).includes(statusrole)) {
                    userStatus.push(status);

                    if (!topStatus)
                        topStatus = status;

                    break;
                }
            }
        }

        return {
            tag:            member.user.tag,
            discriminator:  member.user.discriminator,
            username:       member.user.username,
            nickname:       member.nickname,
            displayName:    member.displayName,
            id:             member.id,
            presence:       member.presence,
            color:          member.displayColor,
            colorHex:       member.displayHexColor,
            avatar:         member.user.displayAvatarURL,
            roles:          member.roles.array().map(this.trimRole),
            highestRole:    member.highestRole.id,
            hoistRole:      member.hoistRole ? member.hoistRole.id : undefined,
            joined:         member.joinedAt,
            created:        member.user.createdAt,
            bot:            member.user.bot,
            level:          userLevel,
            levelColor:     levelColor,
            statuses:       userStatus,
            displayStatus:  topStatus
        };
    }

    public trimGuild(guild: Guild) {
        if (!guild)
            return {
                id:             null,
                name:           null,
                icon:           null,
                createdAt:      null,
                // emoji:        null,
                membercount:    null,
                region:         null
            };

        return {
            id:             guild.id,
            name:           guild.name,
            icon:           guild.iconURL,
            createdAt:      guild.createdAt,
            // emoji:        guild.emoji,
            membercount:    guild.members.array().length,
            region:         guild.region
        };
    }
}
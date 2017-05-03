using Discord.Commands;
using Discord.WebSocket;
using Discord;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Grandayy.Discord.Preconditions {


    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class MinPermissionsAttribute : PreconditionAttribute {
        IEnumerable<GuildPermission> requiredPermissions;

        public MinPermissionsAttribute(GuildPermission[] requiredPermissions) {
            this.requiredPermissions = requiredPermissions;
        }

        public override Task<PreconditionResult> CheckPermissions(ICommandContext context, CommandInfo command, IDependencyMap map) {
            bool allowed = requiredPermissions.All((p) => {
                return (context.User as SocketGuildUser).GuildPermissions.Has(p);
            });

            if (allowed) {
                return Task.FromResult(PreconditionResult.FromSuccess());

            } else {
                return Task.FromResult(PreconditionResult.FromError("Insufficient permissions."));
            }
        }
    }
}
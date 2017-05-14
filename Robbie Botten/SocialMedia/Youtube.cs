using Discord.WebSocket;
using RobbieBotten.Config;
using RobbieBotten.Util;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace RobbieBotten.SocialMedia {
    public class Youtube {
        private ConfigFile config;
        private SocketTextChannel channel;
        private string UUID;
        private string name;

        Timer timer;

        public Youtube(ConfigFile config, SocketTextChannel channel, string UUID, string name) {
            this.config = config;
            this.channel = channel;
            this.UUID = UUID;
            this.name = name;

            Logger.Log($"[Youtube Handler:{name}] Started Youtube checker");

            timer = new Timer(Update, null, 0, config.SocialTick);
        }

        public void Update(object StateInfo) {

        }
    }
}

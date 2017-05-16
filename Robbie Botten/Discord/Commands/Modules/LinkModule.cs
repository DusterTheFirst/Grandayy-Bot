using Discord.Commands;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Discord.Commands.Modules {
    [Summary("Helpful Links")]
    public class LinkModule : ModuleBase{
        [Command("memes", RunMode = RunMode.Async), Alias("m"), Summary("Get Grandayy's memes playlist")]
        public async Task Memes() {
            await Context.Message.DeleteAsync();
            await Context.Channel.SendMessageAsync("https://www.youtube.com/playlist?list=PLd7iEW-IcEboD2dabxaPY2TXKGtkCqyyL");
        }

        [Command("noteblocksongs", RunMode = RunMode.Async), Alias("nbs"), Summary("Get Grande1899's noteblock songs playlist")]
        public async Task NoteblockSongs() {
            await Context.Message.DeleteAsync();
            await Context.Channel.SendMessageAsync("https://www.youtube.com/playlist?list=PL30419C17041A76D9");
        }

        [Command("othermemes", RunMode = RunMode.Async), Alias("nbs"), Summary("Get Grande1899's memes playlist")]
        public async Task OtherMemes() {
            await Context.Message.DeleteAsync();
            await Context.Channel.SendMessageAsync("https://www.youtube.com/playlist?list=PLAgzw7vzgd5D5qH9Hqmn83yVnYLUaF-gE");
        }
    }
}

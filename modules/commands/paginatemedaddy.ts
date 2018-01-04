import { User, TextChannel, Message, ReactionCollector } from "discord.js";

class Paginator {
    /**
     * Current page
     */
    current: number;
    /**
     * Total pages
     */
    total: number;
    pages: string[];
    first: "⏮";
    back: "◀";
    stop: "⏹";
    next: "▶";
    last: "⏭";

    message: Message;

    collector: ReactionCollector;

    constructor(channel: TextChannel, dad: User, pages: string[]) {
        this.current = 0;
        this.total = pages.length;
        this.pages = pages;

        this.first = "⏮";
        this.back = "◀";
        this.stop = "⏹";
        this.next = "▶";
        this.last = "⏭";

        channel.send(pages[0]).then((msg) => {
            /**
             * Message sent
             * @type {Message}
             */
            this.message = msg as Message;
            
            this.message.react(this.first).then(() =>
                this.message.react(this.back).then(() =>
                    this.message.react(this.stop).then(() =>
                        this.message.react(this.next).then(() =>
                            this.message.react(this.last)))));

            this.collector = this.message.createReactionCollector((reaction, user) => reaction.me && user.id === dad.id && user.id !== this.message.author.id, {time: 100000});
            this.collector.on("collect", (reaction, collector) => {
                reaction.remove(dad);

                switch (reaction.emoji.toString()) {
                    case this.first:
                        this.current = 0;
                        break;
                    case this.last:
                        this.current = this.total - 1;
                        break;
                    case this.stop:
                        this.collector.stop();
                        this.message.clearReactions();
                        break;
                        
                    case this.back:
                        this.current--;
                        if (this.current < 0)
                            this.current = this.total - 1;
                        break;

                    case this.next:
                        this.current++;
                        if (this.current > this.total - 1)
                            this.current = 0;
                        break;
                }

                this.refresh();
            });
        });
    }

    refresh() {
        this.message.edit(this.pages[this.current]);
    }
}
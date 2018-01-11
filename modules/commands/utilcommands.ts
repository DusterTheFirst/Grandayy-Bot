import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite";

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createCommand("gmt")
        .addParameter("format", ParameterType.Optional)
        .setDescription("Get the current time in GMT")
        .setCategory("Utility Commands")
        .setCallback((context) => {
            let format: string = context.params.get("format");

            if (format && format.includes("12")) {
                context.channel.send(`It is **${formatDate(new Date(Date.now()).toUTCString().replace(" GMT", ""))}** in Greenwich, England`);
            } else if (!format || format.includes("24")) {
                context.channel.send(`It is **${new Date(Date.now()).toUTCString().replace(" GMT", "")}** in Greenwich, England`);
            }
        });

    handler.createCommand("utc")
        .addParameter("format", ParameterType.Optional)
        .setDescription("Get the current UTC time")
        .setCategory("Utility Commands")
        .setCallback((context) => {
            let format: string = context.params.get("format");

            if (format && format.includes("12")) {
                context.channel.send(`The current UTC time is **${formatDate(new Date(Date.now()).toUTCString().replace(" GMT", ""))}**`);
            } else if (!format || format.includes("24")) {
                context.channel.send(`The current UTC time is **${new Date(Date.now()).toUTCString().replace(" GMT", "")}**`);
            }
        });
};

function stringToBoolean(string: string) {
    console.log(string.toLowerCase().trim());
    switch (string.toLowerCase().trim()){
        case "true": case "yes": case "1": return true;
        case "false": case "no": case "0": case null: return false;
        default: return Boolean(string);
    }
}



function formatDate(date: string) {
    let d = new Date(date);
    let hh = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    let dd = "AM";
    let h = hh;
    if (h >= 12) {
      h = hh - 12;
      dd = "PM";
    }
    if (h === 0) {
      h = 12;
    }
    m = m < 10 ? 0 + m : m;

    s = s < 10 ? 0 + s : s;

    /* if you want 2 digit hours:
    h = h<10?"0"+h:h; */
    let pattern = new RegExp(`0?${hh}:${m}:${s}`);

    let replacement = `${h}:${m}`;
    /* if you want to add seconds
    replacement += ":"+s;  */
    replacement += ` ${dd}`;
    return date.replace(pattern, replacement);
  }
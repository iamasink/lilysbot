"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const format_1 = tslib_1.__importDefault(require("../structure/format"));
const discord_js_1 = require("discord.js");
const log_1 = tslib_1.__importDefault(require("../structure/log"));
// Emitted whenever a user joins a guild.
exports.default = {
    name: "guildMemberRemove",
    async execute(member) {
        if (member.pending) {
            log_1.default.log(member.guild, `${member.id} has left guild ${member.guild}, but never passed rules screening`);
            return;
        }
        log_1.default.log(member.guild, `${member.id} has left guild ${member.guild}`);
        console.log(member);
        console.log(`${member.id} has left guild ${member.guild}`);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(`${member.user.tag} Left.`)
            .setDescription(`They were a member for ${format_1.default.time(Date.now() - member.joinedTimestamp)}.\nJoined on <t:${member.joinedTimestamp.toString().slice(0, -3)}:f>`)
            .setThumbnail(member.user.avatarURL(true));
        member.guild.systemChannel.send({ embeds: [embed] });
    },
};

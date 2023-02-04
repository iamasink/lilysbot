"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { footer } = require('../config.json');
function embed(color, title, description, fields, image, thumbnail, footer) {
    const embed = new EmbedBuilder();
    if (color)
        embed.setColor(color);
    if (title)
        embed.setTitle(title);
    if (description)
        embed.setDescription(description);
    if (fields) {
        for (const f of fields) {
            embed.addFields(f);
        }
    }
    if (image)
        embed.setImage(image);
    if (thumbnail)
        embed.setThumbnail(thumbnail);
    if (footer)
        embed.setFooter(footer);
    console.log(`embed: ${JSON.stringify(embed)}`);
    return [embed];
}
//
exports.default = {
    errorEmbed(when, error) {
        return embed(`#d02721`, `An error occurred!`, undefined, [{
                name: '__Error__',
                value: `${error.name || error}\n${error.message || ''}`
            }], undefined, undefined, undefined);
    },
    successEmbed(title, description) {
        return embed(`#00ff00`, title, description);
    },
    messageEmbed(title, description, fields, color = '#f9beca') {
        return embed(color, title, description, fields);
    },
    warningEmbed(title, description, fields, color = '#f2bb05') {
        return embed(color, title, description, fields);
    },
    /**
     * Creates a profile embed.
     * Has guild member avatar || profile picture as thumbnail,
     * color is user's accent color || pink default
     *
     * @param {*} title
     * @param {*} description
     * @param {*} fields
     * @param {*} user
     * @param {*} guild
     * @return {*}
     */
    async profileEmbed(title, description, fields, user, guild) {
        user = await user.fetch();
        var thumbnail;
        var color;
        if (guild.members.resolve(user) && guild.members.resolve(user).avatar != undefined) {
            thumbnail = `https://cdn.discordapp.com/guilds/${guild.id}/users/${user.id}/avatars/${guild.members.resolve(user).avatar}.webp`;
        }
        else {
            thumbnail = user.avatarURL(true);
        }
        color = user.hexAccentColor || `#f9beca`;
        return embed(color.toString(), title, description, fields, undefined, thumbnail);
    }
};

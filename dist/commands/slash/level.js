"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const embeds_1 = tslib_1.__importDefault(require("../../structure/embeds"));
const format_1 = tslib_1.__importDefault(require("../../structure/format"));
const database_1 = tslib_1.__importDefault(require("../../structure/database"));
const calc_1 = tslib_1.__importDefault(require("../../structure/calc"));
function fetchPromise(toFetch) {
    return new Promise((resolve, reject) => {
        try {
            resolve(toFetch.fetch(true));
        }
        catch {
            reject();
        }
    });
}
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('level')
        .setDescription('Retrieves level...')
        .addSubcommand((command) => command
        .setName('get')
        .setDescription('get a users level')
        .addUserOption((option) => option
        .setName('target')
        .setDescription('A user. Ping or ID')
        .setRequired(true)))
        .addSubcommand((command) => command
        .setName('ranking')
        .setDescription('see a list of the highest levels')),
    async execute(interaction) {
        switch (interaction.getSubcommand) {
            case 'get': {
                // get the user from the option, if no user is provided get the user who ran the command
                const user = interaction.options.getUser('target') || interaction.user;
                // get the guild
                const guild = interaction.guild;
                // get the user's xp from the database
                const xp = await database_1.default.get(`.users.${user.id}.guilds.${guild.id}.xp`);
                //console.log(xp)
                // calculate the level progress and stuff
                const progress = calc_1.default.levelProgress(xp);
                const level = calc_1.default.level(xp);
                const xpLower = calc_1.default.xp(level);
                const xpHigher = calc_1.default.xp(level + 1);
                // send an embed with the information
                const embed = await embeds_1.default.profileEmbed(`${user.username}'s level`, `**Level ${format_1.default.numberCommas(level)} (${format_1.default.numberCommas(xp)} xp)** \n\`[${format_1.default.bar(0, progress, 1, 25)}]\`\n${format_1.default.numberCommas(level)} (${format_1.default.numberCommas(xpLower)} xp) - ${format_1.default.numberCommas(level + 1)} (${format_1.default.numberCommas(xpHigher)} xp)`, null, user, interaction.guild);
                interaction.reply({ embeds: embed });
                break;
            }
            case 'ranking': {
                break;
            }
        }
    }
};

import { SlashCommandBuilder } from 'discord.js';
import embeds from '../../structure/embeds';
import format from '../../structure/format';
import database from '../../structure/database';
import calc from '../../structure/calc';
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
    data: new SlashCommandBuilder()
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
                const xp = await database.get(`.users.${user.id}.guilds.${guild.id}.xp`);
                //console.log(xp)
                // calculate the level progress and stuff
                const progress = calc.levelProgress(xp);
                const level = calc.level(xp);
                const xpLower = calc.xp(level);
                const xpHigher = calc.xp(level + 1);
                // send an embed with the information
                const embed = await embeds.profileEmbed(`${user.username}'s level`, `**Level ${format.numberCommas(level)} (${format.numberCommas(xp)} xp)** \n\`[${format.bar(0, progress, 1, 25)}]\`\n${format.numberCommas(level)} (${format.numberCommas(xpLower)} xp) - ${format.numberCommas(level + 1)} (${format.numberCommas(xpHigher)} xp)`, null, user, interaction.guild);
                interaction.reply({ embeds: embed });
                break;
            }
            case 'ranking': {
                break;
            }
        }
    }
};

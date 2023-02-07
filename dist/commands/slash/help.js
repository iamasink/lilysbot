const { SlashCommandBuilder } = require('discord.js');
export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help me!!'),
    async execute(interaction) {
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder } = require('discord.js');
exports.default = {
    data: new SlashCommandBuilder()
        .setName('moderate')
        .setDescription('moderator commands')
        .addSubcommand((command) => command
        .setName('ban')
        .setDescription('ban a user')),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        interaction.editReply(`Pong!\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
        console.log(JSON.stringify(interaction.client));
    },
};

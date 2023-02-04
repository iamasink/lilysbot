"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../structure/embeds');
const commands = require('../../structure/commands');
exports.default = {
    data: new SlashCommandBuilder()
        .setName('text')
        .setDescription('a!')
        .addStringOption((option) => option
        .setName('text')
        .setDescription('a!')),
    async execute(interaction) {
        const parsed = await commands.textParser(interaction.options.getString('text'), interaction.id, interaction.channelId, interaction.guildId, interaction.user);
        const text = JSON.stringify(parsed);
        console.log(parsed);
        //await interaction.reply(text)
        const command = interaction.client.commands.get(parsed.name);
        console.log(`aaaa command: ${command}`);
        await command.execute(parsed);
    },
};

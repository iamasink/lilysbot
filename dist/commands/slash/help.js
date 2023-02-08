"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder } = require('discord.js');
exports.default = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help me!!'),
    async execute(interaction) {
    },
};

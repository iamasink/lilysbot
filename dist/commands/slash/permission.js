"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
exports.default = {
    permission: 'admin.permission',
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription('set permissions')
        .addSubcommand((command) => command
        .setName('set')
        .setDescription('meow')),
    async execute(interaction) {
    },
};

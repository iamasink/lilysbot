"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('echo')
        .setDescription('Echos you')
        .addStringOption((option) => option.setName('input')
        .setDescription('The input to echo back')
        .setRequired(true)),
    async execute(interaction) {
        await interaction.reply(interaction.options.getString('input'));
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { levels } = require('../config.json');
exports.default = {
    exactLevel(xp = 0) {
        return (1 + Math.sqrt(1 + 8 * xp / levels.threshold)) / 2;
    }
};

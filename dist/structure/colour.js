const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { levels } = require('../config.json');
export default {
    exactLevel(xp = 0) {
        return (1 + Math.sqrt(1 + 8 * xp / levels.threshold)) / 2;
    }
};

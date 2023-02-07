const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { levels } = require('../config.json');
export default {
    exactLevel(xp = 0) {
        return (1 + Math.sqrt(1 + 8 * xp / levels.threshold)) / 2;
    },
    level(xp = 0) {
        return Math.floor(module.exports.exactLevel(xp));
    },
    levelProgress(xp = 0) {
        const level = module.exports.exactLevel(xp);
        console.log(`levelaaa: ${level}`);
        const output = level - Math.floor(level);
        console.log(`output: ${output}`);
        return (output);
    },
    xp(level = 1) {
        return Math.floor((((level * level) - level) * levels.threshold) / 2);
    }
};

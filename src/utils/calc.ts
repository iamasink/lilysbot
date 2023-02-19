import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { levels } from '../config.json'
function exactLevel(xp = 0) {
	return (1 + Math.sqrt(1 + 8 * xp / levels.threshold)) / 2

}

export default {
	exactLevel(xp = 0) {
		exactLevel(xp)
	},
	level(xp = 0) {
		return Math.floor(exactLevel(xp))
	},
	levelProgress(xp = 0) {
		const level = exactLevel(xp)
		console.log(`levelaaa: ${level}`)
		const output = level - Math.floor(level)
		console.log(`output: ${output}`)
		return (output)
	},
	xp(level = 1) {
		return Math.floor((((level * level) - level) * levels.threshold) / 2)
	}
}
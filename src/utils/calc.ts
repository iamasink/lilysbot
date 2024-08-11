import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { levels } from "../config.json"
function exactLevel(xp = 0) {
	// what the fuck is this calculation?
	// i have no idea but it seems to work well. so its staying :)
	// seriously, I suck at math. But it works?
	return (
		(-(levels.threshold / 2) +
			Math.sqrt(
				(levels.threshold / 2) ** 2 + levels.threshold * 2 * xp,
			)) /
		levels.threshold
	)
}

export default {
	exactLevel(xp = 0) {
		return exactLevel(xp)
	},
	level(xp = 0) {
		return Math.floor(exactLevel(xp))
	},
	levelProgress(xp = 0) {
		const level = exactLevel(xp)
		console.log(`levelaaa: ${level}`)
		const output = level - Math.floor(level)
		console.log(`output: ${output}`)
		return output
	},
	xp(level = 0) {
		// this is the opposite of the other calculation :)
		return (levels.threshold / 2) * level * (level + 1)
	},
}

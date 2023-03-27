import {
	SlashCommandBuilder,
	ChatInputCommandInteraction
} from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import calc from '../utils/calc'

export default new ApplicationCommand({
	permissions: ["KickMembers"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const level = 5
		const xp: number = 750

		const calculatedLevel = calc.exactLevel(xp)
		const calculatedXp = calc.xp(calculatedLevel)

		await interaction.reply(`${calculatedLevel} - ${calculatedXp} xp`)
	},
}) 
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import { client } from '..'
import format from '../utils/format'

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('description'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		interaction.reply(`${format.markdownEscape("_hi_")}`)
	},
})
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('options')
		.setDescription('description'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		throw new Error("not implemented LOL")
	},
})
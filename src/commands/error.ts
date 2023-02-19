import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('error')
		.setDescription('cause an error'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		throw new Error("fag")
	},
})
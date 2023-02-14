import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Help me!!'),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		interaction.reply("this command isn't implemented.")
	},
})
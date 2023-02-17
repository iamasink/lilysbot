import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('permissions')
		.setDescription('set permissions')
		.addSubcommand(command => command
			.setName('set')
			.setDescription('meow')
		),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {

	},
})
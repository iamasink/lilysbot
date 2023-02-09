import { SlashCommandOptionsOnlyBuilder, ChatInputApplicationCommandData, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, SharedSlashCommandOptions } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Echos you')
		.addStringOption(option => option
			.setName("hi")
			.setDescription("hi")),
	async execute(interaction): Promise<void> {
		interaction.reply(interaction.options.getString("hi"))
	},
})
import { SlashCommandOptionsOnlyBuilder, ChatInputApplicationCommandData, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, SharedSlashCommandOptions, CommandInteraction, ChatInputCommandInteraction } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Echos you')
		.addStringOption(option => option
			.setName("hi")
			.setDescription("hi")),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		interaction.reply(interaction.options.getString("hi"))
	},
})
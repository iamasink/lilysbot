import { SlashCommandBuilder } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Echos you')
		.addStringOption((option: any) =>
			option.setName('input')
				.setDescription('The input to echo back')
				.setRequired(true)),
	async execute(interaction: any) {
		await interaction.reply(interaction.options.getString('input'))
	},
}
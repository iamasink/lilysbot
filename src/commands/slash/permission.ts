const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { request } = require('undici')

export default {
	permission: 'admin.permission',
	data: new SlashCommandBuilder()
		.setName('permissions')
		.setDescription('set permissions')
		.addSubcommand((command: any) => command
			.setName('set')
			.setDescription('meow')
		),

	async execute(interaction: any) {

	},
}

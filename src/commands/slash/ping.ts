const { SlashCommandBuilder } = require('discord.js')

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: any) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true })
		interaction.editReply(`Pong!\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
		console.log(JSON.stringify(interaction.client))
	},
}
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')
const embeds = require('../../structure/embeds')
const commands = require('../../structure/commands')


module.exports = {
	discordPermissions: [PermissionsBitField.Flags.ManageMessages],
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('bulk delete messages')
		.addStringOption(option => option
			.setName('amount')
			.setDescription('amount of messages to delete')
			.setRequired(true)
		),
	async execute(interaction) {
		await interaction.channel.bulkDelete(interaction.options.getString("amount"))
			.then(async messages => {
				await interaction.reply(`Bulk deleted ${messages.size} messages`)
				setTimeout(() => interaction.deleteReply(), 2000)
			})
	},
}

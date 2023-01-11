const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')
const embeds = require('../../structure/embeds')
const commands = require('../../structure/commands')
const log = require('../../structure/log')



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
		console.log(interaction)
		await interaction.channel.bulkDelete(interaction.options.getString("amount"))
			.then(async messages => {
				await interaction.reply(`Bulk deleted ${messages.size} messages`)
				log.log(interaction.guild, `${interaction.user} bulkdeleted ${messages.size} messages in ${interaction.channel}`)
				setTimeout(() => interaction.deleteReply(), 2000)
			})
	},
}

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')
const embeds = require('../../structure/embeds')
const commands = require('../../structure/commands')
const log = require('../../structure/log')



export default {
	discordPermissions: [PermissionsBitField.Flags.ManageMessages],
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('bulk delete messages')
		.addStringOption((option: any) => option
			.setName('amount')
			.setDescription('amount of messages to delete')
			.setRequired(true)
		),
	async execute(interaction: any) {
		console.log(interaction)
		await interaction.channel.bulkDelete(interaction.options.getString("amount"))
			.then(async (messages: any) => {
				await interaction.reply(`Bulk deleted ${messages.size} messages`)
				log.log(interaction.guild, `${interaction.user} bulkdeleted ${messages.size} messages in ${interaction.channel}`)
				setTimeout(() => interaction.deleteReply(), 2000)
			})
	},
}

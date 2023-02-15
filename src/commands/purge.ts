
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import log from '../utils/log'

export default new ApplicationCommand({
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('bulk delete messages')
		.addNumberOption(option => option
			.setName('amount')
			.setDescription('amount of messages to delete')
			.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (interaction.user.id !== "303267459824353280") {
			throw new Error(`@<${interaction.user.id}>, you're not allowed to do this <3`)
		}

		console.log(interaction)
		await interaction.channel.bulkDelete(interaction.options.getNumber("amount"))
			.then(async messages => {
				await interaction.reply(`Bulk deleted ${messages.size} messages`)
				log.log(interaction.guild, { content: `${interaction.user} bulkdeleted ${messages.size} messages in ${interaction.channel}`, allowedMentions: { repliedUser: false } })
				setTimeout(() => interaction.deleteReply(), 2000)
			})
	},
})
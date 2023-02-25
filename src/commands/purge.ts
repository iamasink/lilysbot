
import { ChatInputCommandInteraction, SlashCommandBuilder, Collection } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import log from '../utils/log'

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('bulk delete messages')
		.addNumberOption(option => option
			.setName('amount')
			.setDescription('amount of messages to delete')
			.setMaxValue(100)
		)
		.addUserOption(option => option
			.setName("user")
			.setDescription("user to delete messages from")
		)
		.addStringOption(option => option
			.setName("before")
			.setDescription("delete messages before (message id)")
			.setMinLength(17)
			.setMaxLength(20)
		)
		.addStringOption(option => option
			.setName("after")
			.setDescription("delete messages after (message id)")
			.setMinLength(17)
			.setMaxLength(20)
		)
	,
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const amount = interaction.options.getNumber("amount") || 100
		const channel = interaction.channel
		const user = interaction.options.getUser("user")
		let todelete = new Collection()
		let lastmessage = interaction.options.getString("before") || channel.lastMessage.id

		while (todelete.size < amount) {
			let messages = await channel.messages.fetch({ limit: 100, before: lastmessage })
			if (user) messages = messages.filter(e => e.author.id === user.id)
		}



		//channel.bulkDelete({})

		// if (interaction.user.id !== "303267459824353280") {
		// 	throw new Error(`<@${interaction.user.id}>, you're not allowed to do this <3`)
		// }

		// console.log(interaction)
		// await interaction.channel.bulkDelete(interaction.options.getNumber("amount"))
		// 	.then(async messages => {
		// 		await interaction.reply(`Bulk deleted ${messages.size} messages`)
		// 		log.log(interaction.guild, { content: `${interaction.user} bulkdeleted ${messages.size} messages in ${interaction.channel}`, allowedMentions: { repliedUser: false } })
		// 		setTimeout(() => interaction.deleteReply(), 2000)
		// 	})
	},
})
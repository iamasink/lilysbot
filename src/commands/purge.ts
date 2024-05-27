
import { ChatInputCommandInteraction, SlashCommandBuilder, Collection, FetchMessageOptions, Message } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import log from '../utils/log'

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Bulk delete messages')
		.addNumberOption(option => option
			.setName('amount')
			.setDescription('amount of messages to delete')
			.setMaxValue(100)
			.setRequired(true)
		)
		.addUserOption(option => option
			.setName("user")
			.setDescription("user to delete messages from")
		)
		.addStringOption(option => option
			.setName("before")
			.setDescription("delete messages before message id (exclusive)")
			.setMinLength(17)
			.setMaxLength(20)
		)
		.addStringOption(option => option
			.setName("after")
			.setDescription("delete messages after message id (exclusive)")
			.setMinLength(17)
			.setMaxLength(20)
		)
	,
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const amount = interaction.options.getNumber("amount") || 5
		const channel = interaction.channel
		const user = interaction.options.getUser("user")
		let todelete = new Collection()
		let before = interaction.options.getString("before")
		let after = interaction.options.getString("after")
		if (before && after) {
			throw new Error("you may only use \`before\` *or* \`after\`")
		}

		let messages: Collection<string, Message<true>>;
		if (before) messages = await channel.messages.fetch({ before: before, limit: 100 })
		else if (after) messages = await channel.messages.fetch({ after: after, limit: 100 })
		else messages = await channel.messages.fetch({ limit: 100 })
		if (user) messages = messages.filter(message => message.author.id === user.id)

		const messageArray = Array.from(messages).slice(0, amount)
		const newMessages = new Collection(messageArray)

		console.log(newMessages)

		channel.bulkDelete(newMessages)
			.then(async m => {
				let note = ""
				if (m.size < amount) note = `*Note: There weren't enough recent messages matching the parameters to delete **${amount}***`
				await interaction.reply(`Bulk deleted **${m.size}** messages.\n${note}`)
				log.log(interaction.guild, `${interaction.user} bulkdeleted ${m.size} messages in ${interaction.channel}`)
				setTimeout(() => interaction.deleteReply(), 5000)
			})

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
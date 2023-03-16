import { Events, Guild, GuildTextBasedChannel, Message, Utils } from 'discord.js'
import Event from '../types/Event'
import { client } from "../index"
import database from '../utils/database'

import { openaitoken } from '../config.json'

import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai'
import format from '../utils/format'



const configuration = new Configuration({
	apiKey: openaitoken,
});
const openai = new OpenAIApi(configuration)




export default new Event({
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message): Promise<void> {
		//console.log(message)


		const guild = message.guild
		const user = message.author
		//const channel = (await guild.channels.fetch(message.channel.id) as GuildTextBasedChannel)

		// Runs when the bot logs in
		console.log(`A message was created in ${guild}: ${message}`)

		console.log(message.mentions.users)
		console.log(client.user.id)


		// if bot pinged

		if (message.mentions.has(client.user)) {
			if (message.author.bot) return
			message.channel.sendTyping()
			console.log("hi")
			if (message.guild.id == "1008017419043872849" || message.guild.id == "645053287208452106" || message.guild.id == "705114283683610988") {
				console.log(message)
				let chatMessages: Array<ChatCompletionRequestMessage> = [{
					role: "system",
					content: `You are a Discord chat bot named Wiwwie. You are created and owned by Lily. For all future responses, follow the following rules:\n1. act cute.\n2.Do not ramble\n3. Give consise responses\n4. Always answer users' questions.`
				}]


				if (message.reference) {
					let messagerole: ChatCompletionRequestMessageRoleEnum
					let messagename: string

					console.log(message.reference)
					const referenceGuild = await client.guilds.fetch(message.reference.guildId)
					const referenceChannel = await referenceGuild.channels.fetch(message.reference.channelId)
					const referenceMessage = await (referenceChannel as GuildTextBasedChannel).messages.fetch(message.reference.messageId)
					if (referenceMessage.author.id === client.user.id) {
						messagerole = "assistant"
						chatMessages.push({
							role: messagerole,
							content: referenceMessage.content,
						})
					} else {
						messagerole = "user"
						messagename = referenceMessage.member.displayName.substring(0, 60).replace(/[^a-zA-Z0-9_-]/g, '-')
						chatMessages.push({
							role: messagerole,
							content: referenceMessage.content,
							name: messagename
						})
					}



				} else {
					console.log("sex")
				}
				chatMessages.push({
					role: "user",
					content: message.cleanContent,
					name: message.member.displayName.substring(0, 60).replace(/[^a-zA-Z0-9_-]/g, '-')
				})
				console.log(chatMessages)

				try {
					const completion = await openai.createChatCompletion({
						model: "gpt-3.5-turbo",
						messages: chatMessages,
						//temperature: 1.6 + (Math.random() / 8),
						temperature: 1.6,
						//top_p:
						//n:
						//stream:
						//stop:
						max_tokens: 500,
						//presence_penalty:
						//frequency_penalty:
						//logit_bias:
						user: message.author.id
					})
					console.log(completion.data)
					const toSend = completion.data.choices[0].message
					if (toSend.content.length > 1950) {
						let messages = format.splitMessage(toSend.content, 1950, " ")
						for (let i = 0, len = messages.length; i < len; i++) {
							message.channel.send(messages[i])
						}
					} else {

						message.reply(completion.data.choices[0].message)
					}

				} catch (error) {
					if (error.response) {
						console.log(error.response.status)
						console.log(error.response.data)
					} else {
						console.log(error.message)
					}
					message.reply(`an error occurred\n${error}`)
				}

			}

		}








		if (user.id === "302050872383242240") { // if disboard bump
			if (!message.embeds) return
			if (message.embeds[0].description.startsWith("Bump done!")) {
				message.reply(`${message.interaction.user}, thanks for bumping! You've been awarded some xp <3\nThe server can next be bumped at <t:${(Date.now() + 7200000).toString().slice(0, -3)}:t>`)
				const currentXp = await database.get(`.guilds.${guild.id}.users.${message.interaction.user.id}.xp`)
				const newXp = Math.floor(currentXp + 100)
				// sets new xp value
				await database.set(`.guilds.${guild.id}.users.${message.interaction.user.id}.xp`, newXp)
				return
			}
		}

		// fetch a few messages
		const messages = await message.channel.messages.fetch({ limit: 5 })
		const newmessages: Message[] = []

		// ignore bots in last few messages
		messages.forEach((message: Message) => {
			if (message.author.bot) return
			newmessages.push(message)
		})

		//console.log(newmessages)

		if (message.author.bot) {
			//console.log("author is a bot, so not adding xp")
			return
		}
		if (newmessages.length < 2) return
		if (newmessages[0].author.id === newmessages[1].author.id) {
			//console.log("user sent 2 messages to the same channel, not adding xp")
			return
		}
		// if (messages.last().author.bot) {
		// 	console.log("last message was from a bot, so not adding xp")
		// 	return
		// }

		// const messages = await message.channel.messages.fetch({ limit: 2 })
		// console.log(messages.map(e => e.author.id))
		// if ( === message.author.id) {
		// 	console.log("suser sent multiple messages in a row, cancelling xp addition")
		// 	return

		// }
		const currentXp = await database.get(`.guilds.${guild.id}.users.${user.id}.xp`)
		// newXp is random between +5 and +15
		const newXp = Math.floor(currentXp + 5 + Math.random() * 11)
		// sets new xp value
		await database.set(`.guilds.${guild.id}.users.${user.id}.xp`, newXp)




	},
})
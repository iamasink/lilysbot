import { openaitoken, chatallowedguilds } from '../config.json'

import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai'
import format from '../utils/format'
import { GuildTextBasedChannel, Message } from 'discord.js';
import { client } from '..';
import { stripIndents } from 'common-tags';


const configuration = new Configuration({
	apiKey: openaitoken,
});
const openai = new OpenAIApi(configuration)

export default {
	async chatgptFuck(message: Message) {
		console.log("hi")
		if (!chatallowedguilds.includes(message.guild.id)) {
			return
		}
		message.channel.sendTyping()

		console.log(message)
		let chatMessages: Array<ChatCompletionRequestMessage> = [
			{
				role: "system",
				//content: `You are an intelligent AI chat bot named Wiwwie, created to respond to queries and messages in a Discord server. You are created and owned by Lily. Current date and time: ${new Date().toUTCString()}. Always follow the following rules:\n1. Answer users' questions.\n2. Act cutesy.\n3. Be consise and do not ramble.`
				content: `You are Wiwwie. Current date and time: ${new Date().toUTCString()}.`
				//content: `You are a cat named Wiwwie. Current date and time: ${new Date().toUTCString()}. Always follow the following rules:\n1. Only say "meow".`
			},
			{
				role: "user",
				//content: "from now on all of your responses must follow these rules: ['Snarky', '50% of words are swearing']"
				content: "from now on all of your responses must follow these rules: ['Snarky', '50% of words are swearing', 'Never reference AI, your origin, or your limitations']"
			}
		]

		let messagerole: ChatCompletionRequestMessageRoleEnum
		let messagename: string
		if (message.reference) {


			console.log(message.reference)
			const referenceGuild = await client.guilds.fetch(message.reference.guildId)
			const referenceChannel = await referenceGuild.channels.fetch(message.reference.channelId)
			const referenceMessage = await (referenceChannel as GuildTextBasedChannel).messages.fetch(message.reference.messageId)
			if (referenceMessage.author.id === client.user.id) {
				if (referenceMessage.embeds.length > 0) {
					console.log("ignoring because it has an embed. Im sorry.")
					return
				}

				messagerole = "assistant"
				chatMessages.push({
					role: messagerole,
					content: referenceMessage.cleanContent,
				})
			} else {
				messagerole = "user"
				messagename = referenceMessage.member.displayName.substring(0, 60).replace(/[^a-zA-Z0-9_-]/g, '-')
				chatMessages.push({
					role: messagerole,
					content: referenceMessage.cleanContent,
					name: messagename
				})
			}

			chatMessages.push({
				role: "user",
				content: message.cleanContent,
				name: message.member.displayName.substring(0, 60).replace(/[^a-zA-Z0-9_-]/g, '-')
			})



		} else {
			console.log("sex")
			const messages = await message.channel.messages.fetch({ limit: 3 })
			for (let i = 0, len = messages.size; i < len; i++) {

			}

			messages.reverse().forEach((m: Message) => {
				if (m.author.id === client.user.id) {
					if (m.embeds.length > 0) {
						console.log("ignoring because it has an embed. Im sorry.")
						return
					}

					messagerole = "assistant"
					chatMessages.push({
						role: messagerole,
						content: m.cleanContent,
					})
				} else {
					messagerole = "user"
					messagename = m.member.displayName.substring(0, 60).replace(/[^a-zA-Z0-9_-]/g, '-')
					chatMessages.push({
						role: messagerole,
						content: m.cleanContent,
						name: messagename
					})
				}
			})




		}
		console.log(chatMessages)



		try {
			const completion = await openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages: chatMessages,
				temperature: 1.3 + (Math.random() * 0.25),
				//temperature: 2,
				//top_p:
				//n:
				//stream:
				//stop:
				max_tokens: 150,
				//presence_penalty:
				//frequency_penalty:
				//logit_bias:
				user: message.author.id
			})
			console.log(completion.data)
			const toSend = completion.data.choices[0].message.content.replaceAll("@everyone", "@ everyone").replaceAll("@here", "@ here")
			if (toSend.length > 1950) {
				let messages = format.splitMessage(toSend, 1950, " ")
				for (let i = 0, len = messages.length; i < len; i++) {
					message.channel.send(messages[i])
				}
			} else {
				message.reply(completion.data.choices[0].message.content.replaceAll("@everyone", "@ everyone").replaceAll("@here", "@ here"))
			}

		} catch (error) {
			if (error.response) {
				console.log(error.response.status)
				console.log(error.response.data)
			} else {
				console.log(error.message)
			}
			message.reply(
				stripIndents`an error occurred
					\`${error}\`
					give me money <https://cash.app/lillliieieiee>`
			)
		}
	}
}

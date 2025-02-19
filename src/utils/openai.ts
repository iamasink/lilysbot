import { openaifeatures, openaitoken, chatallowedguilds } from "../config.json"

import OpenAI from "openai"
import format from "../utils/format"
import { GuildTextBasedChannel, Message, Role } from "discord.js"
import { client } from ".."
import { stripIndents } from "common-tags"
import {
	ChatCompletionMessage,
	ChatCompletionMessageParam,
	ChatCompletionRole,
} from "openai/resources/chat"
import database from "./database"
import settings from "./settings"

const openai = new OpenAI({
	apiKey: openaitoken,
})

export default {
	async openaiMessage(message: Message, random: boolean = false) {
		const userstokens = await database.get<number>(
			`.users.${message.author.id}.aitokenusage`,
		)
		// console.log(userstokens)

		if (!openaifeatures) return new Error("open ai is disabled")

		if (message.author.id == "454357482102587393") {
			return
		}

		// console.log("hi")
		if (!message.inGuild()) return
		if (!chatallowedguilds.includes(message.guild.id)) return

		if (userstokens > 15000 && !random) {
			return message.reply(
				"You've used this quite a lot! Sorry, but you've been temporarily blocked from using chat features.",
			)
		}

		message.channel.sendTyping()

		// console.log(message)
		let chatMessages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
			{
				role: "system",
				//content: `You are an intelligent AI chat bot named Wiwwie, created to respond to queries and messages in a Discord server. You are created and owned by Lily. Current date and time: ${new Date().toUTCString()}. Always follow the following rules:\n1. Answer users' questions.\n2. Act cutesy.\n3. Be consise and do not ramble.`
				content: stripIndents`You are Wiwwie, an intelligent and seamless chat-bot. Never mention AI, or your limitations.
				Current date and time: ${new Date().toUTCString()}.`,
				//content: `You are a cat named Wiwwie. Current date and time: ${new Date().toUTCString()}. Always follow the following rules:\n1. Only say "meow".`
			},
		]

		let messagerole: ChatCompletionRole
		let messagename: string
		if (message.reference) {
			// console.log(message.reference)
			const referenceGuild = await client.guilds.fetch(
				message.reference.guildId,
			)
			const referenceChannel = await referenceGuild.channels.fetch(
				message.reference.channelId,
			)
			const referenceMessage = await (
				referenceChannel as GuildTextBasedChannel
			).messages.fetch(message.reference.messageId)
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
				messagename = referenceMessage.member.displayName
					.substring(0, 60)
					.replace(/[^a-zA-Z0-9_-]/g, "-")
				chatMessages.push({
					role: messagerole,
					content: referenceMessage.cleanContent,
					// content: `${messagename}:\n` + referenceMessage.cleanContent,
					// name: messagename
				})
			}

			chatMessages.push({
				role: "user",
				content: message.cleanContent,
				// content: `${message.member.displayName.substring(0, 60).replace(/[^a-zA-Z0-9_-]/g, '-')}` + message.cleanContent,
				// name: message.member.displayName.substring(0, 60).replace(/[^a-zA-Z0-9_-]/g, '-')
			})
		} else {
			// console.log("hmm")
			const messages = await message.channel.messages.fetch({ limit: 3 })
			for (let i = 0, len = messages.size; i < len; i++) { }

			messages.reverse().forEach((m: Message) => {
				// console.log(m)
				if (m.author.id === client.user.id) {
					if (m.embeds.length > 0) {
						console.log(
							"ignoring because it has an embed. Im sorry.",
						)
						return
					}

					messagerole = "assistant"
					chatMessages.push({
						role: messagerole,
						content: m.cleanContent,
						// content: `${messagename}:\n` + m.cleanContent,
					})
				} else {
					if (m.member) {
						messagerole = "user"
						messagename =
							m.member.displayName
								.substring(0, 60)
								.replace(/[^a-zA-Z0-9_-]/g, "-") ||
							m.author.username ||
							"user"
						chatMessages.push({
							role: messagerole,
							content: m.cleanContent,
							// content: `${messagename}:\n` + m.cleanContent,
							// name: messagename
						})
					}
				}
			})
		}
		// console.log(chatMessages)

		try {
			const model = await settings.get<string>(message.guild, "openai_model")
			// console.log("model is " + use4o)

			// let model = "gpt-3.5-turbo"
			// if (use4o == "4o") {
			// 	model = "gpt-4o"
			// }

			// console.log(model)

			const completion = await openai.chat.completions.create({
				model: model,
				messages: chatMessages,
				temperature: 1.3 + Math.random() * 0.25,
				//temperature: 2,
				//top_p:
				//n:
				//stream:
				//stop:
				max_tokens: 150,
				//presence_penalty:
				//frequency_penalty:
				//logit_bias:
				user: message.author.id,
			})
			// console.log(completion)

			database.set(
				`.users.${message.author.id}.aitokenusage`,
				userstokens + completion.usage.total_tokens,
			)

			const toSend = completion.choices[0].message.content
				.replaceAll("@everyone", "@ everyone")
				.replaceAll("@here", "@ here")
			if (toSend.length > 1950) {
				let messages = format.splitMessage(toSend, 1950, " ")
				for (let i = 0, len = messages.length; i < len; i++) {
					message.channel.send(messages[i])
				}
			} else {
				message.reply(
					completion.choices[0].message.content
						.replaceAll("@everyone", "@ everyone")
						.replaceAll("@here", "@ here"),
				)
			}
		} catch (error) {
			if (error.response) {
				console.log(error.response.status)
				console.log(error.response.data)
			} else {
				console.log(error.message)
			}
			// message.reply(
			// 	stripIndents`an error occurred :(
			// 	\`${error}\`
			// 	`
			// )
		}
	},
}

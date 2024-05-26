import { Events, Guild, GuildTextBasedChannel, Message, Utils } from 'discord.js'
import Event from '../types/Event'
import { client } from "../index"
import database from '../utils/database'
import openai from '../utils/openai'
import BridgeManager from '../structures/BridgeManager'




export default new Event({
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message): Promise<void> {
		//console.log(message)


		const guild = message.guild
		const user = message.author


		client.bridgeManager.handleBridgedMessage(message)


		// handle the stuff for pings and that for ai chatbot
		if (
			message.mentions.has(client.user)
			//|| message.channel.id == "1085933094328090745"
		) {
			if (message.channel.id == "645053287208452112") return
			if (message.content.includes("@everyone")) return
			if (message.author != client.user) {
				openai.openaiMessage(message)
			}
		}
		else if (Math.random() < 0.001 && (message.channel as GuildTextBasedChannel).name == "general" && message.content.length > 10) {
			if (message.channel.id == "645053287208452112") return
			if (message.content.includes("@everyone")) return
			openai.openaiMessage(message, true)
		}

		// if disboard bump
		if (user.id === "302050872383242240") {
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

		// add xp

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
import { EmbedBuilder, Events, GuildTextBasedChannel, Interaction, Message, MessageReaction, ReactionManager, User } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"
import messageCreate from "./messageCreate"
import embeds from "../utils/embeds"
import { type } from "os"
import openai from "../utils/openai"

// Emitted whenever a reaction is added to a message
export default new Event({
	name: Events.MessageReactionAdd,
	async execute(reaction: MessageReaction, user: User) {
		const guild = reaction.message.guild
		const message = reaction.message

		// When a reaction is received, check if the structure is partial
		if (reaction.partial) {
			// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
			try {
				await reaction.fetch()
			} catch (error) {
				console.error('Something went wrong when fetching the message:', error)
				// Return as `reaction.message.author` may be undefined/null
				return
			}
		}

		// Now the message has been cached and is fully available
		console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`)
		// The reaction is now also fully available and the properties will be reflected accurately:
		console.log(`${reaction.count} user(s) have given the same reaction to this message!`)
		console.log(`${reaction.emoji.name}`)

		if (reaction.emoji.name == "⭐") {
			const starboardChannelId = await database.get(`.guilds.${guild.id}.settings.starboard_channel`)
			if (!starboardChannelId) return
			const starboardChannel = (await guild.channels.fetch(starboardChannelId) as GuildTextBasedChannel)

			let previousStars: any[] = await database.get(`.guilds.${guild.id}.starboard`) || []

			// rename this when sane
			const databaseThing = previousStars.find(i => i.originalMessage == message.id)

			// if the message could be found in the database
			if (databaseThing) {
				// this message has already been starred. it will not be resent and instead updated :)
				console.log("this message has already been starred. it will not be resent and instead updated :)")
				const oldMessage = await starboardChannel.messages.fetch(databaseThing.starMessage)
				oldMessage.edit({ content: `${reaction.count} ⭐ in ${message.channel}` })
			} else {
				// dont sent if not enough reactions
				// TODO: change this 1 to a customizable optionx	
				if (reaction.count > 0) {

					// send message in starboard channel
					const author = await guild.members.fetch(message.author.id)
					const url = author.avatarURL({ forceStatic: false }) || author.user.avatarURL({ forceStatic: false })
					const authorName = author.displayName;
					console.log(url)

					let description = message.content
					if (message.editedAt) description += " *(edited)*"

					const embed = new EmbedBuilder()
						.setColor("#ffac33")
						.setAuthor({ name: `${authorName}`, iconURL: url })
						.setDescription(description || "\u200b")
						.setTimestamp(message.createdTimestamp)
						.setFields({ name: "Jump to message:", value: message.url })
					// if (message.embeds) {
					// 	console.log(message.embeds[0])
					// 	embed.setImage(message.embeds[0].url)
					// }

					let image = undefined
					if (message.attachments.size) {
						image = message.attachments.first().url
						embed.setImage(image)
					} else if (message.embeds.length) {
						image = message.embeds[0]
						if (image.video) {
							embed.setImage(image.video.url)
						}
						else if (image.thumbnail) {
							embed.setImage(image.thumbnail.url)
						}
					}

					console.log(embed)

					// save the sentMessage and originalMessage id into the database so they can be looked up later :)
					const sentMessage = await (starboardChannel as GuildTextBasedChannel).send({ content: `${reaction.count} ⭐ in ${message.channel}`, embeds: [embed] })
					previousStars.push({ starMessage: sentMessage.id, originalMessage: message.id })
					await database.set(`.guilds.${guild.id}.starboard`, previousStars)
				}
			}
		} else if (reaction.emoji.id == "1161735847629041684") {


			// reaction.message.reply(`you ${pronouns.name} 😂😂😂😂 have won the internet today`)
			// console.log("reddit!!")
		}
	},
}
)
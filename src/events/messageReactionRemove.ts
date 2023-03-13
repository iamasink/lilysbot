import { EmbedBuilder, Events, GuildTextBasedChannel, Interaction, Message, MessageReaction, ReactionManager, User } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"
import messageCreate from "./messageCreate"
import embeds from "../utils/embeds"
import { type } from "os"

// Emitted whenever a reaction is removed froma message
export default new Event({
	name: Events.MessageReactionRemove,
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
		console.log(`${reaction.message.author}'s message "${reaction.message.content}" lost a reaction!`)
		// The reaction is now also fully available and the properties will be reflected accurately:
		console.log(`${reaction.count} user(s) have given the same reaction to this message!`)

		if (reaction.emoji.name == "⭐") {
			const starboardChannelId = await database.get(`.guilds.${guild.id}.settings.starboard_channel`)
			if (!starboardChannelId) return
			const starboardChannel = (await guild.channels.fetch(starboardChannelId) as GuildTextBasedChannel)

			let previousStars: any[] = await database.get(`.guilds.${guild.id}.starboard`) || []

			// rename this when sane
			const databaseThing = previousStars.find(i => i.originalMessage == message.id)

			// if the message could be found in the database
			if (databaseThing) {
				console.log("this message has already been starred. it will not be resent and instead updated :)")
				const oldMessage = await starboardChannel.messages.fetch(databaseThing.starMessage)
				// TODO: change this 1 to a customizable option
				if (reaction.count > 1) {
					// this message has already been starred. it will not be resent and instead updated :)
					oldMessage.edit({ content: `${reaction.count} ⭐` })
				} else {
					oldMessage.delete()
					// splice 1 element from the index of the found element :)
					previousStars.splice(previousStars.findIndex(i => i.originalMessage == message.id), 1)
					await database.set(`.guilds.${guild.id}.starboard`, previousStars)
				}

			} else {
				// a reaction was lost, so theres no way it should be sent probably
			}
		}
	},
}
)
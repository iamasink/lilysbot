module.exports = {
	name: "messageReactionAdd",
	async execute(reaction, user) {

	},
}

import { Events, Interaction, Message, User } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"

// Emitted whenever a reaction is added to a message
export default new Event({
	name: Events.MessageReactionAdd,
	async execute(reaction, user: User) {
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
	},
}
)
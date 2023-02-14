import { Events, Message } from 'discord.js'
import Event from '../types/Event'
import { client } from "../index"

export default new Event({
	name: Events.MessageCreate,
	once: false,
	execute(message: Message): void {
		// Runs when the bot logs in
		console.log(`A message was created in ${message.guild}: ${message}`)
	},
})
import { Events, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"

// Emitted whenever an audit log entry is created
export default new Event({
	name: Events.GuildAuditLogEntryCreate,
	async execute() {
		console.log("hi")
	},
})
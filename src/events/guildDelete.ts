import { Events, Guild, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"

// Emitted whenever a guild kicks the client or the guild is deleted/left.
export default new Event({
	name: Events.GuildDelete,
	async execute(guild: Guild) {

	},
}
)
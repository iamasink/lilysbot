

import { Events, GuildMember, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import log from "../utils/log"

// Emitted whenever a user is 'updated' in a guild.
export default new Event({
	name: Events.GuildMemberUpdate,
	async execute(member: GuildMember) {
		console.log(member)
		let info = ``
		if (member.pending) {
			info = `\nthey are pending.`
		} else {
			info = `\nthey aren't pending.`
		}
		log.log(member.guild, `${member.id} has been updated.` + info)

	},
}
)
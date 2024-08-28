import { Events, GuildMember, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import log from "../utils/log"
import database from "../utils/database"

// Emitted whenever a user is 'updated' in a guild.
export default new Event({
	name: Events.GuildMemberUpdate,
	async execute(oldMember: GuildMember, newMember: GuildMember) {
		console.log(`a member was updated in ${newMember.guild}`)
		let info = ``
		if (oldMember.pending) {
			info = `\nthey are pending.`
		} else {
			info = `\nthey aren't pending.`
		}
		// log.log(member.guild, `${member.id} has been updated.` + info)

		let o1 = oldMember

		let o2 = newMember

		let diff = Object.keys(o2).reduce((diff, key) => {
			if (o1[key] === o2[key]) return diff
			return {
				...diff,
				[key]: o2[key],
			}
		}, {})
		console.log(diff)
	},
})

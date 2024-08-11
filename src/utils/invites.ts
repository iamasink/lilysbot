import { Guild } from "discord.js"
import { client } from ".."
import database from "./database"
import { InviteSchema } from "../types/Database"

async function updateInviteCache(guild: Guild) {
	console.log(`updating invite cache for ${guild.name}`)

	// Fetch all Guild Invites
	const oldinvites = await database.get<InviteSchema>(`.guilds.${guild.id}.invites`)
	const guildinvites = await guild.invites.fetch()

	guildinvites.map(async (invite) => {
		const code = invite.code
		const inviterId = invite.inviterId
		const uses = invite.uses
		database.set(`.guilds.${guild.id}.invites.${code}.inviterId`, inviterId)
		database.set(`.guilds.${guild.id}.invites.${code}.uses`, uses)
		database.set(`.guilds.${guild.id}.invites.${code}.expired`, false)
		database.set(`.guilds.${guild.id}.invites.${code}.code`, code)
	})
	for (let i in oldinvites) {
		if (guildinvites.has(i)) {
			// console.log(`${guild} - not expired ${i}`)
		} else {
			// console.log(`${guild} - expired ${i}`)
			database.set(`.guilds.${guild.id}.invites.${i}.expired`, true)
		}
	}
}

export default {
	async updateAllInviteCaches() {
		console.log("updating all invite cache")
		client.guilds.cache.forEach(async (guild) => {
			updateInviteCache(guild)
		})
	},

	async updateInviteCache(guild: Guild) {
		updateInviteCache(guild)
	},
}

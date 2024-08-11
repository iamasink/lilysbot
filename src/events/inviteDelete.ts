import { Events, Interaction, Invite, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"

// Emitted whenever an invite is created
export default new Event({
	name: Events.InviteDelete,
	async execute(invite: Invite) {
		console.log(`a invite was deleted: ${invite}`)
		console.log(invite)
		database.set(
			`.guilds.${invite.guild.id}.invites.${invite.code}.expired`,
			true,
		)
	},
})

import { Events, Interaction, Invite, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"

// Emitted whenever an invite is created
export default new Event({
	name: Events.InviteCreate,
	async execute(invite: Invite) {
		console.log(`a invite was created: ${invite}`)
		console.log(invite)
		database.set(`.guilds.${invite.guild.id}.invites.${invite.code}`, {
			inviterId: invite.inviterId,
			uses: invite.uses,
			expired: false,
			code: invite.code,
		})
	},
})

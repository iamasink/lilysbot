const database = require("../structure/database")


// Emitted whenever an invite is created

export default {
	name: "inviteDelete",
	async execute(invite) {
		console.log(`a invite was deleted: ${invite}`)
		console.log(invite)
		database.set(`.guilds.${invite.guild.id}.invites.${invite.code}.expired`, true)

	},
}
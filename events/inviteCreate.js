const database = require("../structure/database")


// Emitted whenever an invite is created

module.exports = {
	name: "inviteCreate",
	async execute(invite) {
		console.log(`a invite was created: ${invite}`)
		console.log(invite)
		database.set(`.guilds.${invite.guild.id}.invites.${invite.code}`, {
			inviterId: invite.inviterId, uses: invite.uses, expired: false
		})

	},
}
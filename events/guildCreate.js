const database = require("../structure/database")


// Emitted whenever the client joins a guild.

module.exports = {
	name: "guildCreate",
	async execute(guild) {
		console.log(`a guild was joined: ${guild}`)
		database.set(`.guilds.${guild.id}.joinedAt`)

		// cache invites
		const guildinvites = await guild.invites.fetch()
		guildinvites.map(async invite => {
			const code = invite.code
			const inviterId = invite.inviterId
			const uses = invite.uses
			database.set(`.guilds.${guild.id}.invites.${code}`, { inviterId: inviterId, uses: uses, expired: false })
		})

	},
}
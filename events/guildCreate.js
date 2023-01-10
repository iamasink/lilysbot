const database = require("../structure/database")


// Emitted whenever the client joins a guild.

module.exports = {
	name: "guildCreate",
	async execute(guild) {
		console.log(`a guild was joined: ${guild}`)
		database.set(`.guilds.${guild.id}.joinedAt`)

	},
}
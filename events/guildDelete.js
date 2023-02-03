

// Emitted whenever a guild kicks the client or the guild is deleted/left.

module.exports = {
	name: "guildDelete",
	async execute(guild) {
		console.log(`a guild was left: ${guild}`)
	},
}
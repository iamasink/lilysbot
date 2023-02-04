

// Emitted whenever a guild kicks the client or the guild is deleted/left.

export default {
	name: "guildDelete",
	async execute(guild: any) {
		console.log(`a guild was left: ${guild}`)
	},
}
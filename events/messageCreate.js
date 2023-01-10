const database = require("../structure/database")

module.exports = {
	name: "messageCreate",
	async execute(message) {
		console.log(`a message was created: ${message} by ${message.author} in ${message.guild}`)
		guild = message.guild
		user = message.author
		//console.log(message)
		// add xp
		//path = `$.${message.guild.id.toString()}.user.${message.author.id}.xp`

		//await database.check(`.${message.guild.id}.users.${message.author.id}`)

		//console.log(`c: ${JSON.stringify(curXp)}`)

		path = `.users.${user.id}.guilds.${guild.id}.xp`
		curXp = await database.get(path) || 0
		// newXp is random between +5 and +14
		newXp = Math.floor(curXp + 5 + Math.random() * 10)

		await database.set(path, newXp)
	},
}
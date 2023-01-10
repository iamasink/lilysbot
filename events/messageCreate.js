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

		curXp = await database.get(path + `.xp`) || 0
		//console.log(`c: ${JSON.stringify(curXp)}`)
		newXp = Math.floor(curXp + 5 + Math.random() * 10)

		path = `.${message.guild.id}.users.${message.author.id}`

		await database.set(`.users.${user.id}.guilds.${guild.id}.xp`, newXp)
	},
}
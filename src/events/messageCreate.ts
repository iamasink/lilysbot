const database = require("../structure/database")
const log = require("../structure/log")

export default {
	name: "messageCreate",
	async execute(message) {
		//console.log(message)
		//console.log(`a message was created: ${message} by ${message.author} in ${message.guild}`)
		guild = message.guild
		user = message.author
		//console.log(`guild: ${guild}`)
		//console.log(`user: ${user}`)
		//console.log(message)
		// add xp
		//path2 = `$.${message.guild.id.toString()}.user.${message.author.id}.xp`

		//await database.check(`.${message.guild.id}.users.${message.author.id}`)

		path2 = `.users.${user.id}.guilds.${guild.id}.xp`
		curXp = await database.get(path2) || 0
		//console.log(`xp: c: ${JSON.stringify(curXp)}`)

		// newXp is random between +5 and +14
		newXp = Math.floor(curXp + 5 + Math.random() * 10)

		await database.set(path2, newXp)

		//console.log(`i would have set database here: ${newXp} at ${path2}`)
	},
}
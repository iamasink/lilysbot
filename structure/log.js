const embeds = require('./embeds')
const database = require('./database')

module.exports = {
	async log(guild, message) {
		channel = await database.get(`.guilds.${guild.id}.settings.log_channel`)
		console.log(channel)
		c = await guild.channels.fetch(channel)
		//console.log(c)
		return c.send(message)
	},
	async channel(guild) {
		return channel = await database.get(`.guilds.${guild.id}.settings.log_channel`)
	}
}
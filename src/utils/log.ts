import { Guild, GuildResolvable, TextChannel, GuildBasedChannel, Message, MessagePayload, MessageCreateOptions } from "discord.js"
import database from "./database"
import { client } from ".."

export default {
	async log(guild: Guild, message: string | MessagePayload | MessageCreateOptions) {
		console.log("logging.. " + message)
		//console.log("2")
		//console.log(guild.id)

		let channelid = await database.get(`.guilds.${guild.id}.settings.log_channel`)
		if (!channelid) {
			console.log("no log channel set. ignoring")
			return
		}
		console.log(channelid)
		let g = await client.guilds.fetch(guild.id)
		let c = await g.channels.fetch(channelid)
		//console.log(c)
		return (c as TextChannel).send(message)
	},
	async channel(guild: Guild): Promise<string> {
		return await database.get(`.guilds.${guild.id}.settings.log_channel`)
	}
}
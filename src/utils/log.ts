import {
	Guild,
	GuildResolvable,
	TextChannel,
	GuildBasedChannel,
	Message,
	MessagePayload,
	MessageCreateOptions,
	GuildEmojiRoleManager,
	GuildTextBasedChannel,
	Snowflake,
} from "discord.js"
import database from "./database"
import { client } from ".."

export default {
	async log(guild: Guild, message: string) {
		console.log("logging.. " + message)
		//console.log("2")
		//console.log(guild.id)

		let channelid = await database.get<Snowflake>(
			`.guilds.${guild.id}.settings.log_channel`,
		)
		if (!channelid) {
			console.log("no log channel set. ignoring")
			return
		} else {
			console.log(channelid)
			let g = await client.guilds.fetch(guild.id)
			let c = await g.channels.fetch(channelid)
			//console.log(c)
			return (c as TextChannel).send({
				content: message,
				allowedMentions: { parse: [], repliedUser: false, users: [] },
			})
		}
	},
	async channel(guild: Guild): Promise<string> {
		return await database.get(`.guilds.${guild.id}.settings.log_channel`)
	},
	async channel2(a: GuildResolvable): Promise<GuildTextBasedChannel> {
		const guild = client.guilds.resolve(a)
		const logchannelid = await database.get<Snowflake>(
			`.guilds.${guild.id}.settings.log_channel`,
		)
		const logchannel = guild.channels.resolve(logchannelid)
		if (!logchannel.isTextBased()) return
		return logchannel
	},
}

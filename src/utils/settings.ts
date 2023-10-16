import { Guild, GuildResolvable, Snowflake } from "discord.js"
import database from "./database"
import { client } from ".."

interface setting {
	name: string
	value: string
	description: string
	type: "channel" | "toggle" | "role"
	default: boolean
}

const settingsList: setting[] = [
	{
		name: "Log Channel",
		value: "log_channel",
		description: "The channel where moderation logs should go.",
		type: "channel",
		default: null
	},
	{
		name: "Starboard Channel",
		value: "starboard_channel",
		description: "The channel for starred messages.",
		type: "channel",
		default: null
	},
	{
		name: "Welcome Message",
		value: "welcome_message",
		description: "Whether to show the member welcome message.",
		type: "toggle",
		default: true
	},
	{
		name: "Member Leave Message",
		value: "leave_message",
		description: "Whether to show a message when a member leaves.",
		type: "toggle",
		default: true
	},
	{
		name: "Member Kick Message",
		value: "leave_kick_message",
		description: "Whether to show a message when a member leaves, when a member is kicked.",
		type: "toggle",
		default: true
	},
	// {
	// 	name: "Member Join Message",
	// 	value: "join_message",
	// 	description: "Whether to show a message when a member joins.",
	// 	type: "toggle",
	// 	default: true
	// },
	// {
	// 	name: 
	// 	value: 
	// 	description: 
	// 	type: 
	// 	default: 
	// }
]


export default {
	async setDefaults(guildId: Snowflake) {
		const currentSettings = await database.get(`.guilds.${guildId}.settings`)


		for (let i = 0, len = settingsList.length; i < len; i++) {
			if (!currentSettings) {
				await database.set(`.guilds.${guildId}.settings`, {})
			}

			const setting = settingsList[i]
			console.log(settingsList[i])
			if (!currentSettings.hasOwnProperty(setting.value)) {
				console.log("it doesnt have it =(")
				database.set(`.guilds.${guildId}.settings.${setting.value}`, setting.default)
			} else {
				console.log("it has it!")
			}
		}
	},
	async get(guild: Guild, setting: string) {
		if (!settingsList.map(e => e.value).includes(setting)) throw new Error("invalid setting")
		const value = await database.get(`.guilds.${guild.id}.settings.${setting}`)
		return value
	},
	async set(guild: Guild, setting: string, value: any) {
		if (!settingsList.map(e => e.value).includes(setting)) throw new Error("invalid setting")
		return await database.set(`.guilds.${guild.id}.settings.${setting}`, value)
	},
	settingsList
}
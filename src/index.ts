import { ChannelType } from "discord.js"
import { Bot } from "./structures/Client"
// create new client from class Bot with intents
export const client = new Bot({ intents: 3276799 })

console.log("test")

async function test() {
	const channel = await client.channels.fetch("1008017419664638048", {
		allowUnknownGuild: true,
	})
	console.log(channel)
	if (channel.type === ChannelType.GuildText) {
		channel.send("hello world")
	}
}

client.start()
//test()

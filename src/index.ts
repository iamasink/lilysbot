import { ChannelType, GatewayIntentBits, IntentsBitField } from "discord.js"
import { Bot } from "./structures/Client"
// create new client from class Bot with intents
export const client = new Bot({
	intents: [
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
	]
})

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


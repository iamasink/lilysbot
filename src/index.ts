import { ChannelType, GatewayIntentBits, IntentsBitField, Partials } from "discord.js"
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
		GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.GuildMember,
		Partials.GuildScheduledEvent,
		Partials.User,
		Partials.ThreadMember
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

function signalHandler(signal) {
	console.log(`Shutting down due to ${signal}. Goodbaii!! 👋 `)
	process.exit()
}

process.on('SIGINT', signalHandler)
process.on('SIGTERM', signalHandler)
process.on('SIGQUIT', signalHandler)


client.start()
//test()


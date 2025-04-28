import {
	ActivityType,
	ChannelType,
	GatewayIntentBits,
	IntentsBitField,
	Partials,
	TextBasedChannel,
	TextChannel,
} from "discord.js"
import { Bot } from "./structures/Client"
import { botlogchannel } from "./config.json"
import format from "./utils/format"
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
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.GuildMember,
		Partials.GuildScheduledEvent,
		Partials.User,
		Partials.ThreadMember,
	],
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
	let res = client.user.setPresence({
		activities: [{ name: `Shutting Down, Bye!`, type: ActivityType.Competing }],
		status: "dnd",
	})
	console.log(res)
	setTimeout(() => {
		client.destroy()
		process.exit()
	}, 1000)
}

async function errorhandler(error) {
	console.log("Uncaught Exception...")
	console.log(error.stack)
	try {
		const channel = await client.channels.fetch(botlogchannel)
		if (channel) {
			const messages = format.splitMessage(
				"Wiwwie crashed\n```js\n" + error.stack + "\n```",
				2000,
				"\n",
				"```js\n",
				"\n```",
			)
			for (let i = 0, len = messages.length; i < len; i++) {
				await (channel as TextChannel).send(messages[i])
			}
		} else {
			throw new Error("No bot log channel")
		}
	} catch (e) {
		console.log(e)
	}
	setTimeout(() => {
		// we can't just process.exit() here, because it always returns 0 to the parent (docker)
		throw new Error(error)
	}, 1000) // Adjust the delay time as needed
}

process.on("SIGINT", signalHandler)
process.on("SIGTERM", signalHandler)
process.on("SIGQUIT", signalHandler)
if (process.env.NODE_ENV === "prod")
	process.once("uncaughtException", errorhandler)
if (process.env.NODE_ENV === "prod")
	process.once("unhandledRejection", errorhandler)

client.start()
//test()

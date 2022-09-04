const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, GatewayIntentBits, ActivityType, Partials } = require('discord.js')
const { token } = require('./config.json') // retrieve token from config

// Client setup
const client = new Client({
	// Fetch the recommended amount of shards from Discord and spawn that amount
	"shards": "auto",
	// Status when starting
	"presence": {
		"status": "dnd",
		"afk": true,
		"activities": [
			{
				"name": "w",
				"type": ActivityType.Watching
			}
		]
	},
	// ? The enumeration for partials.
	// https://discord.js.org/#/docs/discord.js/14.0.3/typedef/Partials
	"partials": [
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember
	],
	// ! Required in Discord.js v14
	// https://discord-api-types.dev/api/discord-api-types-v10/enum/GatewayIntentBits
	"intents": [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent
	]
})




// dynamically retrieve commands
client.commands = new Collection() // add commands to a collection so they can be retrieved elsewhere i think
const commandsPath = path.join(__dirname, 'commands') // path to commands using .join so its not OS dependant. Do I really care about this? No. Should I? Maybe. 
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')) // read the ./commands/ files ending in .js

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	client.commands.set(command.data.name, command) // saves the command to the collection
}

// dynamically retrieve events
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file)
	const event = require(filePath)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args))
	} else {
		client.on(event.name, (...args) => event.execute(...args))
	}
}


client.login(token)
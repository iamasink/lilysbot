const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, GatewayIntentBits } = require('discord.js')
const { token } = require('./config.json')
const Sequelize = require('sequelize')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })





// dynamically retrieve commands
client.commands = new Collection() // add commands to a collection so they can be retrieved elsewhere i think
const commandsPath = path.join(__dirname, 'commands') // path to commands using .join so its not OS dependant
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')) // read the ./commands/ files ending in .js

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath) // why require here? idk
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


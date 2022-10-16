const fs = require('node:fs')
const path = require('node:path')
const { clientId, token } = require('../config.json')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord.js')
const database = require('./database')



async function refreshGlobalCommands() {
	const rest = new REST({ version: '10' }).setToken(token)
	commandList = await getCommands()
	try {
		console.log(`Started refreshing ${commandList.length} global application (/) commands.`)

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commandList },
		)

		console.log(`Successfully reloaded ${data.length} global application (/) commands.`)
		return data.length
	} catch (error) {
		console.error(error)
		throw error
	}
}
async function refreshGuildCommands(guildId) {
	const rest = new REST({ version: '10' }).setToken(token)
	commandList = []

	dbpath = `.${guildId}.commands.aliases`
	//await database.check(`guilds`, `.${guildId}`.commands)
	//await database.check(`guilds`, `.${guildId}`.commands.aliases)

	//aliases = await process.db.json.get(`guilds`, dbpath) || {}

	aliases = await database.get(`guilds`, dbpath) || {}
	for (i in aliases) {
		commandName = aliases[i]
		aliasName = i
		//console.log(`${aliasName} => ${commandName}`)
		command = require(`../commands/slash/${commandName}.js`)
		//console.log(`${aliasName} => ${JSON.stringify(command)}`)
		command.data.name = aliasName

		command = command.data.toJSON()

		//console.log(`${i}: ${JSON.stringify(command)}`)
		commandList.push(command)
	}

	console.log(commandList)

	try {
		console.log(`Started refreshing ${commandList.length} guild application (/) commands.`)

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commandList }
		)


		console.log(`Successfully reloaded ${data.length} guild application commands.`)

	}
	catch (error) {
		console.error(error)
		throw error
	}
}

async function deployCommands() {
	commandList = getCommands()
	console.log(commandList)
	//console.log(commandList[3].options)
	refreshGuildCommands(`645053287208452106`)
	return refreshGlobalCommands()

}

async function getCommands() {
	console.log("!!!")
	const commands = []
	// reads files from files directory
	const commandsPath = path.join(__dirname, '..', 'commands', 'slash')
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

	for (const file of commandFiles) {
		const command = require(`../commands/slash/${file}`)
		commands.push(command.data.toJSON())
	}
	//console.log(commands)
	return commands
}

async function getGuildCommands() {
	const commands = []

}


module.exports = {
	get() {
		return getCommands()
	},
	deploy() {
		return deployCommands()
	},
	refreshGuild(guildID) {
		refreshGuildCommands(guildID)
	},
	async textParser(text, id, channelId, guildId, user,) {
		fakeinteraction = {
			'id': id,
			'channelId': channelId,
			'guildId': guildId,
			'user': user,
		}



		command = { "text": text }
		text = text.split(" ")
		console.log(text)

		commands = await getCommands()
		console.log(`commands = ${commands}`)

		for (i in commands) {
			console.log(`text[0] = ${text[0]}`)
			console.log(`commands[${i}] = ${commands[i]}`)
			console.log(`commands[i].name = ${commands[i].name}`)//
			if (text[0] == commands[i].name) {
				command = commands[i]
			}
		}

		console.log(`command: ${JSON.stringify(command)}`)




		return fakeinteraction
	},
}
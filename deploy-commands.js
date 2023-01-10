const commands = require("./structure/commands")




commands.deploy()

// const { clientId, token } = require('./config.json')
// const { REST } = require('@discordjs/rest')
// const { Routes } = require('discord.js')
// const commands = require('./structure/commands.js')
// const database = require('./structure/database')



// async function refreshGlobalCommands() {
// 	try {
// 		console.log(`Started refreshing ${commandList.length} global application (/) commands.`)

// 		const data = await rest.put(
// 			Routes.applicationCommands(clientId),
// 			{ body: commandList },
// 		)

// 		console.log(`Successfully reloaded ${data.length} global application (/) commands.`)
// 	} catch (error) {
// 		console.error(error)
// 		throw error
// 	}
// }
// async function refreshGuildCommands(guildId) {
// 	commandList = {}
// 	path = `.${guildId}.commands.aliases`
// 	//await database.check(`guilds`, `.${guildId}`.commands)
// 	//await database.check(`guilds`, `.${guildId}`.commands.aliases)

// 	aliases = await process.db.get(`guilds`, path) || {}
// 	console.log(`aliases: ${JSON.stringify(aliases)}`)
// 	//database.set(path + `.xp`, newXp)

// 	// try {
// 	// 	console.log(`Finished refreshing ${commandList.length} guild application (/) commands.`)

// 	// 	const data = await rest.put(
// 	// 		Routes.applicationGuildCommands(clientId, guildId),
// 	// 		{ body: commands }
// 	// 	)


// 	// 	console.log(`Successfully registered ${data.length} guild application commands.`)

// 	// }
// 	// catch (error) {
// 	// 	console.error(error)
// 	// 	throw error
// 	// }
// }

// async function deployCommands() {
// 	commandList = commands.getCommands()
// 	console.log(commandList)
// 	console.log(commandList[3].options)

// 	const rest = new REST({ version: '10' }).setToken(token)
// 	refreshGlobalCommands()
// 	refreshGuildCommands(`645053287208452106`)

// }


// deployCommands()


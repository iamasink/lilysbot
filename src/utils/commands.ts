import fs from 'node:fs'
import path from 'node:path'
import { clientId, token } from '../config.json'
import { REST } from '@discordjs/rest'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteractionOptionResolver, PermissionsBitField, Routes } from 'discord.js'
import ApplicationCommand from '../types/ApplicationCommand'
import { client } from '../index'
import embeds from './embeds'

function merge(a: any, b: any, prop: any) {
	var reduced = a.filter((aitem: any) => !b.find((bitem: any) => aitem[prop] === bitem[prop]))
	return reduced.concat(b)
}

async function refreshGlobalCommands() {
	const rest = new REST({ version: '10' }).setToken(token)
	let commandList = await getCommands() //.concat(await getContextMenuCommands())
	console.log(commandList)
	try {
		console.log(`Started refreshing ${commandList.length} global application (/) commands.`)

		const data: any = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commandList.map(e => e.data) },
		)

		console.log(`Successfully reloaded ${data.length} global application (/) commands.`)
		return data.length
	} catch (error) {
		console.error(error)
		throw error
	}
}
// async function refreshGuildCommands(guildId: any) {
// 	const rest = new REST({ version: '10' }).setToken(token)
// 	const commandList = []

// 	const dbpath = `.guilds.${guildId}.commands.aliases`
// 	//await database.check(`guilds`, `.${guildId}`.commands)
// 	//await database.check(`guilds`, `.${guildId}`.commands.aliases)

// 	//aliases = await process.db.json.get(`guilds`, dbpath) || {}

// 	const aliases = await database.get(dbpath) || {}
// 	const commands = []
// 	for (const i in aliases) {
// 		console.log(`i = ${i}`)
// 		console.log(`aliases[i]: `)
// 		console.log(aliases[i])
// 		const commandName = aliases[i].commandname
// 		const defaultoptions = aliases[i].defaultoptions
// 		const group = aliases[i].group
// 		const subcommand = aliases[i].subcommand
// 		const description = aliases[i].description
// 		const aliasName = i
// 		//console.log(`${aliasName} => ${commandName}`)
// 		let command = new SlashCommandBuilder()
// 		console.log(typeof require(`../commands/slash/${commandName}`).data)
// 		console.log(require(`../commands/slash/${commandName}`).data.toJSON())
// 		const data = require(`../commands/slash/${commandName}`).data.toJSON() //ty emily for fixing this ily <3<3<3<3<3<3<3
// 		const newcommanddata = data
// 		//console.log(`${aliasName} => ${JSON.stringify(command)}`)
// 		console.log(newcommanddata.options)

// 		// get group and subcommand stuff
// 		// flatten stuff, set main command to subcommand / bring subcommand up
// 		if (group) {
// 			console.log(`group = ${group}`)
// 			newcommanddata.options = newcommanddata.options.find((element: any) => element.name === group).options
// 			console.log(newcommanddata.options)
// 		}
// 		if (subcommand) {
// 			console.log(`subcommand = ${subcommand}`)
// 			console.log("awawa")
// 			newcommanddata.options = newcommanddata.options.find((element: any) => element.name === subcommand).options
// 			console.log(newcommanddata.options)
// 		}
// 		for (let i = 0; i < defaultoptions.length; i++) {
// 			console.log(defaultoptions[i])
// 		}
// 		var a = newcommanddata.options
// 		var b = defaultoptions
// 		console.log("a")
// 		console.log(a)
// 		console.log("b")
// 		console.log(b)
// 		if (Array.isArray(b)) {
// 			console.log("booobs")
// 		} else {
// 			console.log("no lol")
// 			b = [b]
// 		}

// 		// 	remove item from a if it exists in b
// 		var reduced = a.filter((aitem: any) => !b.find((bitem: any) => aitem["name"] === bitem["name"]))
// 		newcommanddata.options = reduced

// 		console.log(`new options:`)
// 		console.log(newcommanddata.options)
// 		console.log(newcommanddata)





// 		// adjust guild command 
// 		// 	change name to alias name
// 		newcommanddata.name = aliasName
// 		// 	remove options set in defaultoptions from the command
// 		console.log(defaultoptions)
// 		// var a = command.data.options
// 		// var b = options
// 		// // 	remove item from a if it exists in b
// 		// var reduced = a.filter(aitem => !b.find(bitem => aitem["name"] === bitem["name"]))
// 		// command.data.options = reduced
// 		// console.log("merged")
// 		// console.log(reduced)
// 		if (aliases[i].hidedefaults) {
// 			console.log("hide options set")
// 			//newcommanddata.options = newcommanddata.options.filter(e => e.name !== "")

// 		}
// 		if (aliases[i].hidealloptions) {
// 			console.log("hide all options")
// 			newcommanddata.options = []
// 		}


// 		const newcommand = newcommanddata


// 		//console.log(`${i}: ${JSON.stringify(command)}`)
// 		commandList.push(newcommand)
// 	}

// 	console.log(commandList)

// 	try {
// 		console.log(`Started refreshing ${commandList.length} guild application (/) commands.`)

// 		const data = await rest.put(
// 			Routes.applicationGuildCommands(clientId, guildId),
// 			{ body: commandList }
// 		)


// 		console.log(`Successfully reloaded ${data.length} guild application commands.`)

// 	}
// 	catch (error) {
// 		console.error(error)
// 		throw error
// 	}
// }

async function deployCommands() {
	//commandList = getCommands()
	//console.log(commandList)
	//console.log(commandList[3].options)
	//refreshGuildCommands(`645053287208452106`)
	return refreshGlobalCommands()
}

async function getCommands(): Promise<ApplicationCommand[]> {
	console.log("!!!")
	const commands: ApplicationCommand[] = []
	// reads files from files directory
	// const commandsPath = path.join(__dirname, '..', 'commands')
	// const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.ts'))

	// for (const file of commandFiles) {
	// 	const command = require(`../commands/${file}`)
	// 	console.log(file)
	// 	if (command.tempType === 'new') {
	// 		commands.push(command.data)
	// 		//console.log(command.data)
	// 	} else {
	// 		commands.push(command.data.toJSON())
	// 		//console.log(command.data)
	// 	}
	// }
	//console.log(commands)

	const commandfilepath = path.join(__dirname, '..', 'commands')
	console.log(commandfilepath)
	const commandFiles: string[] = fs.readdirSync(commandfilepath).filter(
		(file) => file.endsWith('.js') || file.endsWith('.ts')
	)
	console.log(commandFiles)
	for (let i = 0, len = commandFiles.length; i < len; i++) {
		const file = commandFiles[i]
		const command: ApplicationCommand = (await import(`../commands/${file}`)).default as ApplicationCommand
		console.log("awa" + file)
		commands.push(command)
	}
	console.log("commands:")
	console.log(commands)
	return commands
}


async function getGuildCommands() {
	const commands = []

}

async function getContextMenuCommands() {
	console.log('context menu commands,,')
	const commands = []

	const commandsPath = path.join(__dirname, '..', 'commands', 'contextmenu')
	const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.ts'))

	for (const file of commandFiles) {
		const command = require(`../commands/contextmenu/${file}`)
		console.log(file)
		console.log(command.data.name)
		commands.push(command.data.toJSON())
	}
	return commands
}


export default {
	get() {
		return getCommands()
	},
	deploy() {
		return deployCommands()
	},
	// refreshGuild(guildID: string) {
	// 	refreshGuildCommands(guildID)
	// },
	/**
	 *Runs a command, optionally with altered interaction group, subcommand, options
	 *
	 * @param {*} interaction 	command interaction
	 * @param {*} [commandName=interaction.commandName] 
	 * @param {string} group
	 * @param {string} subcommand
	 * @param {{name: string, type: number, value: *}[]} options
	 */
	async run(interaction: any, commandName = interaction.commandName, group?: any, subcommand?: any, options?: any) {
		// if theres no options present, create a new options resolver

		if (group != null) {
			console.log(`group = ${group}`)
			interaction.options._group = group
		}
		if (subcommand != null) {
			console.log(`subcommand = ${subcommand}`)
			interaction.options._subcommand = subcommand
		}
		if (options != null) {
			console.log("balls")
			//if (!interaction.options._hoistedOptions) interaction.options = new CommandInteractionOptionResolver(client, )

			// merge options with interaction's options, new options should overwrite
			console.log(interaction.options._hoistedOptions)
			console.log(options)
			interaction.options._hoistedOptions = merge(interaction.options._hoistedOptions, options, "name")
			console.log("merged	")
			console.log(interaction.options._hoistedOptions)
		}
		console.log("commandName: " + commandName)
		const command = await interaction.client.commands.get(commandName)


		try {
			// handle discord permissions
			let acceptedPermissions = []
			let deniedPermissions = []
			let permissionsText = `Permissions:`
			let permlist = command.discordPermissions || []

			// for every permission set in the command, check it
			for (var i = 0; i < permlist.length; i++) {
				console.log(i)
				if (interaction.member.permissions.has(permlist[i])) {
					console.log("yes")
					acceptedPermissions.push(permlist[i])
				} else {
					console.log("no")
					deniedPermissions.push(permlist[i])
				}
			}
			for (var i = 0; i < deniedPermissions.length; i++) {
				permissionsText += `\n🚫  **${new PermissionsBitField(deniedPermissions[i]).toArray()}**` // get text name for each permission
			}
			for (var i = 0; i < acceptedPermissions.length; i++) {
				permissionsText += `\n✅  **${new PermissionsBitField(acceptedPermissions[i]).toArray()}**`
			}

			if (deniedPermissions.length > 0) {
				interaction.reply({ ephemeral: true, embeds: embeds.warningEmbed(`You don't have permission to perform this command`, `${permissionsText}`) })
				return
			}

			console.log(interaction.options)
			console.log("running command")
			await command.execute(interaction) // trys to run the command
			return await interaction
		} catch (error) {
			console.error(error)
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('errorreport')
						.setLabel('Report Error')
						.setStyle(ButtonStyle.Danger),
				)
			interaction.channel.send({ embeds: embeds.errorEmbed(`Running command **${interaction.commandName}**`, error), components: [row], ephemeral: true })

		}
	},
	async textToCommandParser(text = "") {
		console.log(text)

		// split text by spaces
		let words = text.split(' ')
		if (words[0].startsWith("/")) words[0] = words[0].substring(1)
		const commandName = words[0]
		const commands = await module.exports.get()
		let group: any
		let subcommand: any
		let optionsStart: any

		let options = {}
		if (!words[1]) words[1] = ""
		if (!words[2]) words[2] = ""

		// parse group and subcommand
		// if words[1] and words[2] aren't options
		if (!words[1].endsWith(":") && !words[2].endsWith(":")) {
			group = words[1]
			subcommand = words[2]
			optionsStart = 3
		}
		// if only words[1] isn't an option
		else if (!words[1].endsWith(":") && words[2].endsWith(":")) {
			group = null
			subcommand = words[1]
			optionsStart = 2
		}
		// if both are options
		else {
			group = null
			subcommand = null
			optionsStart = 1
		}

		for (let i = 0, len = commands.length; i < len; i++) {
			console.log(commands[i].name)
		}

		// get command
		console.log(`commandName = ${commandName}`)
		const command = await commands.find((e: any) => e.name == commandName)
		console.log(`command found: ${JSON.stringify(command)}`)

		if (!command) throw new Error("Command not found")

		console.log("so far..")
		console.log(`group = ${group}`)
		console.log(`subcommand = ${subcommand}`)
		console.log(`optionsStart = ${optionsStart}`)

		// find group
		let commandgroup = await command.options.find((e: any) => e.name == group && e.type == 2) || command
		console.log(`commandgroup = ${JSON.stringify(commandgroup)}`)
		let commandsubcommand = await commandgroup.options.find((e: any) => e.name == subcommand && e.type == 1) || commandgroup
		console.log(`commandsubcommand = ${JSON.stringify(commandsubcommand)}`)

		let foundoptions: any = []
		// parse options
		// for each word from optionsStart to end
		for (let i = optionsStart, len = words.length; i < len; i++) {
			if (words[i].endsWith(":")) {
				// remove colon
				let option = words[i].substring(0, words[i].length - 1)
				console.log(`option = ${option}`)
				// type 1 is an subcommand (not group)

				// if it hasn't been chosen yet
				if (!foundoptions.find((e: any) => e.name == option)) {
					// if it exists in the command
					if (await commandsubcommand.options.find((e: { name: string; type: number }) => e.name == option && e.type == 3)) {
						console.log(`option found ${words[i]}, ${i}`)
						foundoptions.push({ name: option, position: i })
					}
				}
			}
		}
		return ([commandName, group, subcommand, options])

	},
}
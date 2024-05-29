import fs from "node:fs"
import path from "node:path"
import { clientId, token } from "../config.json"
import { REST } from "@discordjs/rest"
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	CommandInteractionOptionResolver,
	ComponentType,
	GuildTextBasedChannel,
	Message,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	PermissionsBitField,
	Routes,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import { client } from "../index"
import embeds from "./embeds"
import database from "./database"
import config from "../config.json"
import { setTimeout } from "node:timers"
import { Octokit } from "@octokit/rest";
import format from "./format"

function merge(a: any, b: any, prop: any) {
	const reduced = a.filter(
		(aitem: any) => !b.find((bitem: any) => aitem[prop] === bitem[prop]),
	)
	return reduced.concat(b)
}

async function refreshGlobalCommands() {
	const rest = new REST({ version: "10" }).setToken(token)
	const commandList = await getCommands() //.concat(await getContextMenuCommands())
	console.log(commandList)
	try {
		console.log(`Started refreshing ${commandList.length} global application (/) commands.`,)

		const data: any = await rest.put(Routes.applicationCommands(clientId), {
			body: commandList.map((e) => e.data),
		})

		console.log(`Successfully reloaded ${data.length} global application (/) commands.`,)
		return data.length
	} catch (error) {
		console.error(error)
		throw error

	}
}
async function refreshGuildCommands(guildId: any) {
	const rest = new REST({ version: '10' }).setToken(token)
	const commandList = []

	const dbpath = `.guilds.${guildId}.commands.aliases`
	//await database.check(`guilds`, `.${guildId}`.commands)
	//await database.check(`guilds`, `.${guildId}`.commands.aliases)

	//aliases = await process.db.json.get(`guilds`, dbpath) || {}

	const aliases = await database.get(dbpath) || {}
	const commands = []
	for (const i in aliases) {
		console.log(`i = ${i}`)
		console.log(`aliases[i]: `)
		console.log(aliases[i])
		const commandName = aliases[i].commandname
		const defaultoptions = aliases[i].defaultoptions
		const group = aliases[i].group
		const subcommand = aliases[i].subcommand
		const description = aliases[i].description
		const aliasName = i
		//console.log(`${aliasName} => ${commandName}`)
		let command = new SlashCommandBuilder()
		console.log(typeof require(`../commands/${commandName}`).data)
		console.log(await client.commands.get(commandName).data.toJSON())
		//const data = require(`../commands/${commandName}`).data.toJSON() //~~ty emily for fixing this ily <3<3<3<3<3<3<3~~ this was a terrible solution lol
		const data = await client.commands.get(commandName).data.toJSON()
		const newcommanddata = data
		//console.log(`${aliasName} => ${JSON.stringify(command)}`)
		console.log(newcommanddata.options)

		// get group and subcommand stuff
		// flatten stuff, set main command to subcommand / bring subcommand up
		if (group) {
			console.log(`group = ${group}`)
			newcommanddata.options = newcommanddata.options.find((element: any) => element.name === group).options
			console.log(newcommanddata.options)
		}
		if (subcommand) {
			console.log(`subcommand = ${subcommand}`)
			console.log("awawa")
			newcommanddata.options = newcommanddata.options.find((element: any) => element.name === subcommand).options
			console.log(newcommanddata.options)
		}
		for (let i = 0; i < defaultoptions.length; i++) {
			console.log(defaultoptions[i])
		}
		var a = newcommanddata.options
		var b = defaultoptions
		console.log("a")
		console.log(a)
		console.log("b")
		console.log(b)
		if (Array.isArray(b)) {
			console.log("booobs")
		} else {
			console.log("no lol")
			b = [b]
		}

		// 	remove item from a if it exists in b
		var reduced = a.filter((aitem: any) => !b.find((bitem: any) => aitem["name"] === bitem["name"]))
		newcommanddata.options = reduced

		console.log(`new options:`)
		console.log(newcommanddata.options)
		console.log(newcommanddata)

		// adjust guild command
		// 	change name to alias name
		newcommanddata.name = aliasName
		// 	remove options set in defaultoptions from the command
		console.log(defaultoptions)
		// var a = command.data.options
		// var b = options
		// // 	remove item from a if it exists in b
		// var reduced = a.filter(aitem => !b.find(bitem => aitem["name"] === bitem["name"]))
		// command.data.options = reduced
		// console.log("merged")
		// console.log(reduced)
		if (aliases[i].hidedefaults) {
			console.log("hide options set")
			//newcommanddata.options = newcommanddata.options.filter(e => e.name !== "")

		}
		if (aliases[i].hidealloptions) {
			console.log("hide all options")
			newcommanddata.options = []
		}

		const newcommand = newcommanddata

		//console.log(`${i}: ${JSON.stringify(command)}`)
		commandList.push(newcommand)
	}

	console.log(commandList)

	try {
		console.log(`Started refreshing ${commandList.length} guild application (/) commands.`)

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commandList }
		)

		console.log(`Successfully reloaded ${(data as any).length} guild application commands.`)

	}
	catch (error) {
		console.error(error)
		throw error
	}
}

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

	const commandfilepath = path.join(__dirname, "..", "commands")
	console.log(commandfilepath)

	const commandFiles: string[] = fs.readdirSync(commandfilepath).filter((file) => file.endsWith(".js") || file.endsWith(".ts"))

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
	// console.log('context menu commands,,')
	// const commands = []
	// const commandsPath = path.join(__dirname, '..', 'commands', 'contextmenu')
	// const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.ts'))
	// for (const file of commandFiles) {
	// 	const command = require(`../commands/contextmenu/${file}`)
	// 	console.log(file)
	// 	console.log(command.data.name)
	// 	commands.push(command.data.toJSON())
	// }
	// return commands
}



export default {
	get() {
		return getCommands()
	},
	deploy() {
		return deployCommands()
	},
	refreshGuild(guildID: string) {
		refreshGuildCommands(guildID)
	},
	async run(
		interaction: any,
		type: "slash" | "messagecontext" | "usercontext",
		commandName = (interaction as CommandInteraction).commandName,
		group?: string,
		subcommand?: string,
		options?: (
			any
		)[],
	) {
		let newInteraction: any = interaction

		// if theres no options present, create a new options resolver
		// this probably kinda a stupid way to do everything but like idc
		if (!newInteraction.options) newInteraction.options = new (CommandInteractionOptionResolver as any)(client, [])
		//console.log(newInteraction)


		if (group != null) {
			//console.log(`group = ${group}`)
			newInteraction.options._group = group
		}
		if (subcommand != null) {
			//console.log(`subcommand = ${subcommand}`)
			newInteraction.options._subcommand = subcommand
		}
		if (options != null) {
			//console.log("balls")
			//if (!interaction.options._hoistedOptions) interaction.options = new CommandInteractionOptionResolver(client, )
			if (!interaction.options._hoistedOptions) interaction.options._hoistedOptions = []

			// merge options with interaction's options, new options should overwrite
			//console.log(newInteraction.options._hoistedOptions)
			//console.log(options)
			newInteraction.options._hoistedOptions = merge(newInteraction.options._hoistedOptions, options, "name",)
			//console.log("merged	")
			//console.log(newInteraction.options._hoistedOptions)
		}
		//console.log("commandName: " + commandName)
		const command = client.commands.get(commandName)
		//console.log("command: ")
		//console.log(command)

		try {
			// handle discord permissions
			const acceptedPermissions = []
			const deniedPermissions = []
			const permlist = command.permissions || []
			//console.log(command.permissions)
			let permissionsText = "Permissions:"



			// for every permission set in the command, check it
			for (let i = 0; i < permlist.length; i++) {
				if (permlist[i] == "botowner") {
					if (interaction.user.id !== config.permissions.botowner) {
						interaction.reply({
							ephemeral: true,
							embeds: embeds.warningEmbed(`You don't have permission to perform the command **${commandName}**`, `🚫 **Bot Owner**`,),
						})
						return
					}
				} else {
					console.log(i)
					if ((interaction.member.permissions as any).has(permlist[i])) {
						console.log("yes")
						acceptedPermissions.push(permlist[i])
					} else {
						console.log("no")
						deniedPermissions.push(permlist[i])
					}
				}
			}
			for (let i = 0; i < deniedPermissions.length; i++) {
				permissionsText += `\n🚫 ** ${new PermissionsBitField(deniedPermissions[i],).toArray()}**` // get text name for each permission
			}
			for (let i = 0; i < acceptedPermissions.length; i++) {
				permissionsText += `\n✅ ** ${new PermissionsBitField(acceptedPermissions[i],).toArray()}**`
			}

			if (deniedPermissions.length > 0) {
				interaction.reply({
					ephemeral: true,
					embeds: embeds.warningEmbed(`You don't have permission to perform the command **${commandName}**`, `${permissionsText}`,),
				})
				return
			}

			// console.log(newInteraction)
			//console.log("running command")
			if (!type) type = "slash"
			switch (type) {
				case "slash": {
					await command.execute(newInteraction) // trys to run the command
					break
				}
				case "messagecontext": {
					await command.menuMessage(newInteraction) // trys to run the command

					break
				}
				case "usercontext": {
					await command.menuUser(newInteraction) // trys to run the command
					break
				}
				default: {
					throw new Error("you fucked up")
				}
			}
			return newInteraction
		} catch (error) {
			console.error(error)
			const row: any = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId("errorreport")
						.setLabel("Report Error")
						.setStyle(ButtonStyle.Danger),
				)
			let message = {
				embeds: embeds.errorEmbed(
					`Running command **${interaction.commandName}**`,
					error,
				),
				components: [row],
				ephemeral: true,
				fetchReply: true
			}
			let msg: Message

			if (interaction.replied) {
				msg = await interaction.followUp(message)
			} else {
				try {
					console.log("reply")
					msg = await interaction.reply(message)
				} catch (e) {
					console.log(e)
					console.log("editreply")
					await interaction.editReply(message)
					msg = await interaction.message
				}
			}

			const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 2 * 60 * 1000 });

			collector.on('collect', async i => {
				if (i.user.id === interaction.user.id) {
					console.log(`${i.user.id} clicked on the ${i.customId} button.`)

					const modal = new ModalBuilder()
						.setCustomId('myModal')
						.setTitle('Reporting an Error')


					// Add components to modal

					// Create the text input components
					const reportInput = new TextInputBuilder()
						.setCustomId('errorReportModalField')
						// The label is the prompt the user sees for this input
						.setLabel("What went wrong?")
						// Short means only a single line of text
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(false)
						.setPlaceholder("What happaned? Why are you reporting this error!!!?")
						.setMaxLength(1800)

					// An action row only holds one text input,
					// so you need one action row per text input.
					const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reportInput);

					// Add inputs to the modal
					modal.addComponents(firstActionRow);

					// Show the modal to the user
					await i.showModal(modal);

					const filter = i => {
						return i.user.id === interaction.user.id;
					}
					i.awaitModalSubmit({ time: 240 * 1000, filter })
						.then(async i => {
							interaction.deleteReply()
							const usermessage = i.fields.getTextInputValue('errorReportModalField')
							const content = `error: \`\`\`${error.toString()}\`\`\`\nOn command: \`${interaction.commandName}\`\nOptions: \`\`\`${JSON.stringify(interaction.options)}\`\`\`\nReported by: \`${format.shittyUsername(interaction.user)} (${interaction.user.id})\`\nUser's Message: \`\`\`${usermessage}\`\`\``

							client.channels.fetch("767026023387758612").then((channel: GuildTextBasedChannel) => {
								console.log(channel.name)
								channel.send(content)
								return
							})

							// create an github issue from the error report
							const octokit = new Octokit({
								auth: config.github.token
							})

							let title = format.cutToLength(`Error report from command "${interaction.commandName}" - ${usermessage}`, 250)

							octokit.issues.create({ owner: "iamasink", repo: "lilysbot", title: title, body: content, labels: ["report"] })
								.then(async res => {
									await i.reply({ embeds: embeds.successEmbed(`Thank you for your submission!\nLink: ${res.data.html_url}`), ephemeral: true, fetchReply: true })
								})
						})
						.catch(err => console.log(err))
				} else {
					i.reply({ content: `These buttons aren't for you!`, ephemeral: true })
						.then(msg => {
							setTimeout(() => {
								msg.delete()
							}, 1000)
						})
				}
			});


		}
	},
	async textToCommandParser(text = "") {
		console.log(text)

		// split text by spaces
		const words = text.split(" ")
		if (words[0].startsWith("/")) words[0] = words[0].substring(1)
		const commandName = words[0]
		const commands = client.commands
		let group: any
		let subcommand: any
		let optionsStart: any

		const options = {}
		if (!words[1]) words[1] = ""
		if (!words[2]) words[2] = ""

		// parse group and subcommand
		// if words[1] and words[2] aren't options
		if (words[1] && !words[1].endsWith(":") && words[2] && !words[2].endsWith(":")) {
			group = words[1]
			subcommand = words[2]
			optionsStart = 3
		}
		// if only words[1] isn't an option
		else if (words[1] && !words[1].endsWith(":") && words[2] && words[2].endsWith(":")) {
			group = null
			subcommand = words[1]
			optionsStart = 2
		}
		// if both are options
		else if (words[1] && words[1].endsWith(":") && words[2] && words[2].endsWith(":")) {
			group = null
			subcommand = null
			optionsStart = 1

		}
		// if there are no options or subcommand
		else {
			group = null
			subcommand = null
			optionsStart = -1
		}

		for (let i = 0, len = commands.size; i < len; i++) {
			console.log(commands[i])
		}

		// get command
		console.log(`commandName = ${commandName}`)
		const command = await commands.find((e: ApplicationCommand) => e.data.name == commandName)
		console.log(`command found: ${JSON.stringify(command)}`)

		if (!command) throw new Error("Command not found")

		console.log("so far..")
		console.log(`group = ${group}`)
		console.log(`subcommand = ${subcommand}`)
		console.log(`optionsStart = ${optionsStart}`)

		// // find group
		// const commandgroup =
		// 	(await command.options.find(
		// 		(e: any) => e.name == group && e.type == 2,
		// 	)) || command
		// console.log(`commandgroup = ${JSON.stringify(commandgroup)}`)
		// const commandsubcommand =
		// 	(await commandgroup.options.find(
		// 		(e: any) => e.name == subcommand && e.type == 1,
		// 	)) || commandgroup
		// console.log(`commandsubcommand = ${JSON.stringify(commandsubcommand)}`)

		// const foundoptions: any = []
		// // parse options
		// // for each word from optionsStart to end
		// for (let i = optionsStart, len = words.length; i < len; i++) {
		// 	if (words[i].endsWith(":")) {
		// 		// remove colon
		// 		const option = words[i].substring(0, words[i].length - 1)
		// 		console.log(`option = ${option}`)
		// 		// type 1 is an subcommand (not group)

		// 		// if it hasn't been chosen yet
		// 		if (!foundoptions.find((e: any) => e.name == option)) {
		// 			// if it exists in the command
		// 			if (
		// 				await commandsubcommand.options.find(
		// 					(e: { name: string; type: number }) =>
		// 						e.name == option && e.type == 3,
		// 				)
		// 			) {
		// 				console.log(`option found ${words[i]}, ${i}`)
		// 				foundoptions.push({ name: option, position: i })
		// 			}
		// 		}
		// 	}
		// }
		return [commandName, group, subcommand, options]
	},
}

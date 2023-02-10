import { Events, Interaction, Message } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import commands from "../utils/commands"
import database from "../utils/database"


// Emitted when an interaction is created.
export default new Event({
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`)
		const guildID = interaction.guild.id


		if (interaction.isChatInputCommand()) {
			console.log("chatinput")


			//console.log(interaction)
			//console.log(interaction.commandName)
			//console.log(interaction.client)
			//console.log(interaction.client.commands)
			//console.log(interaction.options)



			// checks if the command is an aliased (guild) command
			//const dbpath = `.guilds.${guildID}.commands.aliases`
			//const aliases = await database.get(dbpath) || {}
			// console.log(`aliases: ${JSON.stringify(aliases)}`)
			// const aliasedCommand = aliases[interaction.commandName]
			// //console.log(aliasedCommand)
			// if (aliasedCommand) {
			// 	commands.run(interaction, aliasedCommand.commandname, aliasedCommand.group, aliasedCommand.subcommand, aliasedCommand.defaultoptions)
			//} else {
			commands.run(interaction)
			//}

		}

		else if (interaction.isAutocomplete()) {
			const command = client.commands.get(interaction.commandName)

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`)
				return
			}

			try {
				await command.autocomplete(interaction)
			} catch (error) {
				console.error(error)
			}
		}

		else if (interaction.isUserContextMenuCommand()) {
			// gets the (global) command data from the interaction
			console.log(interaction.commandName)
			const command = await client.commands.get(interaction.commandName)
			console.log(command)

			if (!command) {
				console.log(`${interaction} not a command.`)
			}
			commands.run(interaction)

		}

		else if (interaction.isMessageContextMenuCommand()) { /* empty */ }

		// if interaction is from a message (ie buttons, select menu, etc)
		else {
			const id = interaction.customId.split(".")
			const command = client.commands.get(id[0])
			console.log(command)
			if (interaction.isSelectMenu()) {
				// const command = interaction.client.commands.get(interaction.message.interaction.commandName)
				// if (command) {
				// 	console.log(command)
				// 	try {
				// 		await command.menu(interaction)

				// 	} catch (error) {
				// 		console.error(error)
				// 		interaction.reply({ embeds: embeds.errorEmbed(`Running menu interaction **${interaction.customId}** for **${interaction.commandName}**`, error), ephemeral: true })
				// 	}
				if (command != null) {
					command.menu(interaction)
				} else {
					console.log(`interaction ${interaction.customId} not command idk`)
				}
			}

			else if (interaction.isButton()) {
				// if () {
				// 	commandName = interaction.message.interaction.commandName.split(" ")[0]
				// 	const command = interaction.client.commands.get(commandName)
				// 	console.log(command)
				// 	try {
				// 		await command.button(interaction)
				// 	} catch (error) {
				// 		console.error(error)
				// 		interaction.reply({ embeds: embeds.errorEmbed(`Running button interaction **${interaction.customId}** for **${commandName}**`, error), ephemeral: true })
				// 	}
				// } else 


				// handle non command buttons (eg on error)
				if (interaction.customId === "errorreport") {
					console.log(interaction.message)
					interaction.update({ components: [] })
					client.channels.fetch("767026023387758612").then((channel: any) => {
						console.log(channel.name)
						channel.send("error: " + JSON.stringify(interaction.message, null, 2))
						return
					})
				} else {
					if (command != null) {
						command.button(interaction)
					} else {
						console.log(`interaction ${interaction.customId} not command idk`)
					}
				}
				//todo: handle role menus 
			}
		}
	}
}
)
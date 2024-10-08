import {
	ActionRowBuilder,
	Events,
	GuildTextBasedChannel,
	Interaction,
	Message,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js"
import Event from "../types/Event"
import commands from "../utils/commands"
import embeds from "../utils/embeds"
import format from "../utils/format"
import database from "../utils/database"
import config from "../config.json"
import type { Bot } from "../structures/Client"

// Emitted when an interaction is created.
export default new Event({
	name: Events.InteractionCreate,
	async execute(interaction: Interaction, client: Bot) {
		let location: string
		if (interaction.channel) location = interaction.channel.name
		else location = "dms"
		console.log(
			`${interaction.user} in #${location} triggered an interaction.`,
		)

		//const guildID = interaction.guild.id

		if (interaction.isChatInputCommand()) {
			console.log("chatinput")

			//console.log(interaction)
			//console.log(interaction.commandName)
			//console.log(interaction.client)
			//console.log(interaction.client.commands)
			//console.log(interaction.options)

			//checks if the command is an aliased (guild) command
			if (interaction.inGuild()) {
				const dbpath = `.guilds.${interaction.guild.id}.commands.aliases`
				const aliases = (await database.get(dbpath)) || {}
				console.log(`aliases: ${JSON.stringify(aliases)}`)
				const aliasedCommand = aliases[interaction.commandName]
				//console.log(aliasedCommand)
				if (aliasedCommand) {
					return commands.run(
						interaction,
						"slash",
						aliasedCommand.commandname,
						aliasedCommand.group,
						aliasedCommand.subcommand,
						aliasedCommand.defaultoptions,
					)
				} else {
					return commands.run(interaction, "slash")
				}
			} else {
				return commands.run(interaction, "slash")
			}
		} else if (interaction.isAutocomplete()) {
			// console.log(interaction)

			const command = client.commands.get(interaction.commandName)
			// handle discord permissions
			const acceptedPermissions = []
			const deniedPermissions = []
			const permlist = command.permissions || []
			//console.log(command.permissions)

			// Check if the command is for owners only and if interaction executor are the owners
			if (
				command.settings?.ownerOnly &&
				interaction.user.id !== config.permissions.botowner
			) {
				return
			}

			// for every permission set in the command, check it
			for (const permission of permlist) {
				console.log(permission)

				if (interaction.memberPermissions.has(permission)) {
					console.log("yes")
					acceptedPermissions.push(permission)
				} else {
					console.log("no")
					deniedPermissions.push(permission)
				}
			}

			for (let i = 0; i < deniedPermissions.length; i++) {
				// permissionsText += `\n🚫 ** ${new PermissionsBitField(deniedPermissions[i],).toArray()}**` // get text name for each permission
			}
			for (let i = 0; i < acceptedPermissions.length; i++) {
				// permissionsText += `\n✅ ** ${new PermissionsBitField(acceptedPermissions[i],).toArray()}**`
			}

			if (deniedPermissions.length > 0) {
				// console.log(interaction)
				await interaction.respond([
					{ name: "🚫 No Permission!", value: "" },
				])
				console.log(`denied! ${interaction.user}`)
				return
			}

			console.log(command)
			if (!command) {
				console.error(
					`No command matching ${interaction.commandName} was found.`,
				)
				return
			}

			try {
				await command.autocomplete(interaction)
			} catch (error) {
				console.error(error)
			}
		} else if (interaction.isUserContextMenuCommand()) {
			// gets the (global) command data from the interaction
			console.log(interaction.commandName)
			const command = await client.commands.get(interaction.commandName)
			console.log(command)

			if (!command) {
				console.log(`${interaction} not a command.`)
			}
			commands.run(interaction, "usercontext")
		} else if (interaction.isMessageContextMenuCommand()) {
			// gets the (global) command data from the interaction
			console.log(interaction.commandName)
			const command = await client.commands.get(interaction.commandName)
			console.log(command)

			if (!command) {
				console.log(`${interaction} not a command.`)
			}
			commands.run(interaction, "messagecontext")
		}

		// if interaction is from a message (ie buttons, select menu, etc)
		else {
			const id = interaction.customId.split(".")
			const command = client.commands.get(id[0])
			console.log(command)
			if (interaction.isStringSelectMenu()) {
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
					console.log(
						`interaction ${interaction.customId} not command idk`,
					)
				}
			} else if (interaction.isButton()) {
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
				} else {
					if (command != null) {
						command.button(interaction)
					} else {
						console.log(
							`interaction ${interaction.customId} not command idk`,
						)
					}
				}
				//todo: handle role menus
			}
		}
	},
})

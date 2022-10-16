const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const embeds = require('../structure/embeds')
const { permissions } = require('../config.json')
const database = require('../structure/database')


// Emitted when an interaction is created.
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`)
		//console.log(interaction.guild.id)
		guildID = interaction.guild.id


		if (interaction.isChatInputCommand()) {


			console.log(interaction)
			console.log(interaction.commandName)
			console.log(interaction.client)
			console.log(interaction.client.commands)
			//console.log(interaction.options)



			// checks if the command is an aliased (guild) command
			dbpath = `.${guildID}.commands.aliases`
			aliases = await database.get(`guilds`, dbpath)
			//console.log(`aliases: ${JSON.stringify(aliases)}`)
			const aliasedCommand = aliases[interaction.commandName]
			//console.log(aliasedCommand)
			if (aliasedCommand) interaction.commandName = aliasedCommand

			// gets the (global) command data from the interaction
			const command = await interaction.client.commands.get(interaction.commandName)
			console.log(command)

			if (!command && !aliasedCommand) {
				console.log(`${interaction} not a command.`)
			}



			// aliases = await database.get(`guilds`, dbpath) || {}
			// for (i in aliases) {
			// 	commandName = i
			// 	aliasName = aliases[i]
			// 	console.log(`${ aliasName } => ${ commandName }`)

			try {
				// handle discord permissions
				acceptedPermissions = []
				deniedPermissions = []
				permissionsText = `Permissions:`
				permlist = command.discordPermissions || []

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
					throw { name: `You don't have permission to perform this command\n${permissionsText}` }
				}

				if (command.permission == `botowner` && interaction.user.id != permissions[command.permission]) throw { name: `You don't have permission to perform this command\nRequired permission: *${command.permission}*` }
				console.log("running command")
				await command.execute(interaction) // trys to run the command
			} catch (error) {
				console.error(error)
				const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('errorreport')
							.setLabel('Report Error')
							.setStyle(ButtonStyle.Danger),
					)
				interaction.reply({ embeds: embeds.errorEmbed(`Running command **${interaction.commandName}**`, error), components: [row], ephemeral: true })

			}
		} else if (interaction.isUserContextMenuCommand()) {

		} else if (interaction.isMessageContextMenuCommand()) {

		}
		// if interaction is from a message (ie buttons, select menu, etc)
		else {
			id = interaction.customId.split(".")
			const command = interaction.client.commands.get(id[0])
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
					client.channels.fetch('767026023387758612').then(channel => {
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

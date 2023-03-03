import { ActionRowBuilder, Events, GuildTextBasedChannel, Interaction, Message, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import commands from "../utils/commands"
import embeds from "../utils/embeds"


// Emitted when an interaction is created.
export default new Event({
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		let location: string
		if (interaction.channel) location = interaction.channel.name
		else location = "dms"
		console.log(`${interaction.user.tag} in #${location} triggered an interaction.`)

		//const guildID = interaction.guild.id


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
			console.log(interaction)

			const command = client.commands.get(interaction.commandName)

			console.log(command)
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

		else if (interaction.isMessageContextMenuCommand()) { }

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
					const modal = new ModalBuilder()
						.setCustomId('myModal')
						.setTitle('Reporting an Error');


					// Add components to modal

					// Create the text input components
					const reportInput = new TextInputBuilder()
						.setCustomId('errorReportModalField')
						// The label is the prompt the user sees for this input
						.setLabel("What went wrong?")
						// Short means only a single line of text
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(false)
						.setValue("hi")

					// An action row only holds one text input,
					// so you need one action row per text input.
					const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reportInput);

					// Add inputs to the modal
					modal.addComponents(firstActionRow);

					// Show the modal to the user
					await interaction.showModal(modal);

					const filter = i => {
						return i.user.id === interaction.user.id;
					};
					interaction.awaitModalSubmit({ time: 240 * 1000, filter })
						.then(i => i.reply({ embeds: embeds.successEmbed('Thank you for your submission!'), ephemeral: true }))
						.catch(err => console.log(err));

					console.log(interaction.message)
					interaction.update({ components: [] })
					client.channels.fetch("767026023387758612").then((channel: GuildTextBasedChannel) => {
						console.log(channel.name)
						channel.send("error: " + JSON.stringify(interaction.message))
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
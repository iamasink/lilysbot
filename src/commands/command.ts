import { ChatInputCommandInteraction } from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import database from "../utils/database"
import embeds from "../utils/embeds"
import commands from "../utils/commands"

const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')

export default new ApplicationCommand({
	permissions: ["Administrator"],
	data: new SlashCommandBuilder()
		.setName('command')
		.setDescription('Configure commands')
		.addSubcommandGroup(group => group
			.setName('alias')
			.setDescription('alias')
			.addSubcommand(command => command
				.setName('create')
				.setDescription('create an alias')
				.addStringOption(option => option
					.setName('alias')
					.setDescription('alias to create')
					.setRequired(true)

				).addStringOption(option => option
					.setName("commandname")
					.setDescription("commandname")
					.setRequired(true)
				)
				.addStringOption(option => option
					.setName("group")
					.setDescription("group")
				)
				.addStringOption(option => option
					.setName("subcommand")
					.setDescription("subcommand")
				)
				.addStringOption(option => option
					.setName("defaultoptions")
					.setDescription("defaultoptions")
				)
				.addBooleanOption(option => option
					.setName('hidealloptions')
					.setDescription('hide options?')
				)
				.addStringOption(option => option
					.setName('description')
					.setDescription('override description'))
			)
			.addSubcommand(command => command
				.setName('remove')
				.setDescription('remove an alias')
				.addStringOption(option => option
					.setName('alias')
					.setDescription('alias to remove')
					.setRequired(true)
				)
			)
			.addSubcommand(command => command
				.setName('list')
				.setDescription('list all aliases')
			)
		)
		.addSubcommandGroup(group => group
			.setName('command')
			.setDescription('command')
			.addSubcommand(command => command
				.setName('enable')
				.setDescription('enable a disabled command')
				.addStringOption(option => option
					.setName('command')
					.setDescription('command to enable')
					.setRequired(true)
				)
			)
			.addSubcommand(command => command
				.setName('disable')
				.setDescription('disable a command')
				.addStringOption(option => option
					.setName('command')
					.setDescription('command to disable')
					.setRequired(true)
				)
			)
			.addSubcommand(command => command
				.setName('list')
				.setDescription('list all commands')
			)
		)
		.addSubcommand(command => command
			.setName('run')
			.setDescription('run a command')
			.addStringOption(option => option
				.setName('command')
				.setDescription('command to run')
				.setRequired(true)
			)
		),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		switch (interaction.options.getSubcommandGroup()) {
			case 'alias': {
				const alias = interaction.options.getString('alias')
				console.log('alias: ' + alias)
				// const command = interaction.options.getString('command')
				// var sub = interaction.options.getString('subcommand')
				// if (sub) {
				// 	var sub = sub.split(' ')
				// 	switch (sub.length) {
				// 		case 0: {

				// 			break
				// 		} case 1: {
				// 			var subcommand = sub[0]
				// 			break
				// 		} case 2: {
				// 			var group = sub[0]
				// 			var subcommand = sub[1]
				// 			break
				// 		} default: {
				// 			throw new Error('Invalid group / subcommand option')
				// 		}
				// 	}
				// }




				const guildID = interaction.guild.id
				const path = `.guilds.${guildID}.commands.aliases`
				const aliasPath = path + '.' + alias
				var value: string
				var exists: boolean

				if (alias) {
					try {
						value = await database.get(aliasPath)
					} catch (e) {
						value = undefined
					}
					console.log(`value: ${value}`)
					if (value) exists = true
					else exists = false
				}

				switch (interaction.options.getSubcommand()) {
					case 'create': {
						if (exists) throw new Error(`$${aliasPath} already exists`)
						//interaction.deferReply()
						try {
							const command = interaction.options.getString("commandname")
							const group = interaction.options.getString("group")
							const subcommand = interaction.options.getString("subcommand")
							const defaultoptions = JSON.parse(interaction.options.getString("defaultoptions"))
							const hidealloptions = interaction.options.getBoolean('hidealloptions')
							const description = interaction.options.getString('description')
							console.log(defaultoptions)

							const data = { commandname: command, group: group, subcommand: subcommand, defaultoptions: defaultoptions || [], hidedefaults: true, hidealloptions: hidealloptions, description: description }
							await database.set(aliasPath, data)
							interaction.reply({ embeds: embeds.successEmbed("Created alias successfully") })
						}
						catch (err) {
							interaction.reply({ embeds: embeds.errorEmbed("Creating alias", err) })
							throw new Error(`Alias $${aliasPath} could not be created\n${err}`)

						}
						break
					}
					case 'remove': {
						if (!exists) throw new Error(`${aliasPath} does not exist`)
						try {
							await database.del(aliasPath)
							interaction.reply({ embeds: embeds.successEmbed("Created removed successfully") })
						}
						catch (err) {
							interaction.reply({ embeds: embeds.errorEmbed("Removing alias", err) })
						}
						break
					}
					case 'list': {
						value = await database.get(path)
						await interaction.reply({ embeds: embeds.messageEmbed("List:", JSON.stringify(value)) })
						break
					}
				}
				await commands.refreshGuild(guildID)
				break
			}
			case 'command': {
				const command = interaction.options.getString('command')
				console.log('command: ' + command)
				const guildID = interaction.guild.id
				const path = `.${guildID}.commands.global`
				const commandPath = path + '.' + command
				value = await database.get(commandPath)
				interaction.reply({ embeds: embeds.messageEmbed("Command:", JSON.stringify(value)) })
				break
			}
			case 'run': {
				break
			}
		}
	}
})
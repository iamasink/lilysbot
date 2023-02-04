// const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')
// const commands = require('../../structure/commands')
// const database = require('../../structure/database')
// const embeds = require('../../structure/embeds')

export default {
	data: new SlashCommandBuilder()
		.setName('command')
		.setDescription('Configure commands')
		.addSubcommandGroup((group: any) => group
			.setName('alias')
			.setDescription('alias')
			.addSubcommand((command: any) => command
				.setName('create')
				.setDescription('create an alias')
				.addStringOption((option: any) => option
					.setName('alias')
					.setDescription('alias to create')
					.setRequired(true)

				).addStringOption((option: any) => option
					.setName("commandname")
					.setDescription("commandname")
					.setRequired(true)
				)
				.addStringOption((option: any) => option
					.setName("group")
					.setDescription("group")
				)
				.addStringOption((option: any) => option
					.setName("subcommand")
					.setDescription("subcommand")
				)
				.addStringOption((option: any) => option
					.setName("defaultoptions")
					.setDescription("defaultoptions")
				)
				.addBooleanOption((option: any) => option
					.setName('hidealloptions')
					.setDescription('hide options?')
				)
				.addStringOption((option: any) => option
					.setName('description')
					.setDescription('override description'))
			)
			.addSubcommand((command: any) => command
				.setName('remove')
				.setDescription('remove an alias')
				.addStringOption((option: any) => option
					.setName('alias')
					.setDescription('alias to remove')
					.setRequired(true)
				)
			)
			.addSubcommand((command: any) => command
				.setName('list')
				.setDescription('list all aliases')
			)
		)
		.addSubcommandGroup((group: any) => group
			.setName('command')
			.setDescription('command')
			.addSubcommand((command: any) => command
				.setName('enable')
				.setDescription('enable a disabled command')
				.addStringOption((option: any) => option
					.setName('command')
					.setDescription('command to enable')
					.setRequired(true)
				)
			)
			.addSubcommand((command: any) => command
				.setName('disable')
				.setDescription('disable a command')
				.addStringOption((option: any) => option
					.setName('command')
					.setDescription('command to disable')
					.setRequired(true)
				)
			)
			.addSubcommand((command: any) => command
				.setName('list')
				.setDescription('list all commands')
			)
		)
		.addSubcommand((command: any) => command
			.setName('run')
			.setDescription('run a command')
			.addStringOption((option: any) => option
				.setName('command')
				.setDescription('command to run')
				.setRequired(true)
			)
		),

	async execute(interaction: any) {
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
				let value: any
				let exists: boolean

				if (alias) {
					try {
						value = await database.get(aliasPath)
					} catch (e) {
						value = undefined
					}
					console.log(`value: ${value}`)
					if (value) exists = true
					else exists = false
				} else {
					value = undefined
					exists = false
				}

				switch (interaction.options.getSubcommand()) {
					case 'create': {
						if (exists) throw new Error(`$${aliasPath} already exists`)
						//interaction.deferReply()
						try {
							const command: string = interaction.options.getString("commandname")
							const group: string = interaction.options.getString("group")
							const subcommand: string = interaction.options.getString("subcommand")
							const defaultoptions: object = JSON.parse(interaction.options.getString("defaultoptions"))
							const hidealloptions: boolean = interaction.options.getBoolean('hidealloptions')
							const description: string = interaction.options.getString('description')
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
				const value = await database.get(commandPath)
				interaction.reply({ embeds: embeds.messageEmbed("Command:", JSON.stringify(value)) })
				break
			}
			case 'run': {
				break
			}
		}
	}
}
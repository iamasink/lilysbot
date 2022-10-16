const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js')
const commands = require('../../structure/commands')
const database = require('../../structure/database')
const embeds = require('../../structure/embeds')

module.exports = {
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
				)
				.addStringOption(option => option
					.setName('command')
					.setDescription('command')
				)
			)
			.addSubcommand(command => command
				.setName('remove')
				.setDescription('remove an alias')
				.addStringOption(option => option
					.setName('alias')
					.setDescription('alias to remove')
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
				)
			)
			.addSubcommand(command => command
				.setName('disable')
				.setDescription('disable a command')
				.addStringOption(option => option
					.setName('command')
					.setDescription('command to disable')
				)
			)
			.addSubcommand(command => command
				.setName('list')
				.setDescription('list all commands')
			)
		),

	async execute(interaction) {
		switch (interaction.options.getSubcommandGroup()) {
			case 'alias': {
				const alias = interaction.options.getString('alias')
				console.log('alias: ' + alias)
				const command = interaction.options.getString('command')
				const guildID = interaction.guild.id
				const path = `.${guildID}.commands.aliases`
				const aliasPath = path + '.' + alias
				await database.checks(`guilds`, [`${guildID}`, "commands", "aliases"])

				if (alias) {
					try {
						value = await database.get(`guilds`, aliasPath)
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
							await database.set(`guilds`, aliasPath, command)
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
							await database.del(`guilds`, aliasPath)
							interaction.reply({ embeds: embeds.successEmbed("Created removed successfully") })
						}
						catch (err) {
							interaction.reply({ embeds: embeds.errorEmbed("Removing alias", err) })
						}
						break
					}
					case 'list': {
						value = await database.get(`guilds`, path)
						interaction.reply({ embeds: embeds.messageEmbed("List:", JSON.stringify(value)) })
						break
					}
				}
				await commands.refreshGuild(guildID)
			}
			case 'command': {
				const command = interaction.options.getString('command')
				console.log('command: ' + command)
				const guildID = interaction.guild.id
				const path = `.${guildID}.commands.global`
				const commandPath = path + '.' + command
				await database.checks(`guilds`, [`${guildID}`, "commands", "global"])
				value = await database.get(`guilds`, commandPath)
				interaction.reply({ embeds: embeds.messageEmbed("Command:", JSON.stringify(value)) })


				break
			}
		}
	}
}
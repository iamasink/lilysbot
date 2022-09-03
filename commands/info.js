const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require('discord.js')

function fetchUser(user) {
	return new Promise((resolve, reject) => {
		try {
			resolve(user.fetch(true))
		} catch { reject() }
	})
}

function exists(val, name) {
	output = `${capitalizeFirstLetter(name)}: `
	if (val) {
		output += `${val}`
	} else {
		output += `No '${name}' found`
	}
	return output
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Retrieves info...')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user'))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('guild')
				.setDescription('Info about the guild')),

	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'user': {
				const user = interaction.options.getUser('target') || interaction.user

				console.log(interaction.options.getString('info'))
				fetchUser(user).then(user => {
					info = `ID: ${user.id}
Username: ${user.username}
Discriminator: ${user.discriminator}
Bot ?: ${user.bot}
System ?: ${user.system}
Created at: ${user.createdAt}
Created timestamp: ${user.createdTimestamp}
Accent color: ${user.hexAccentColor}
${banner}
${exists(user.avatarURL(true), `avatar`)} `
				})

				break
			}
			case 'guild': {

			}

		}

	},
}
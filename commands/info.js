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
					info = `${exists(user.username, `Username`)}
${exists(user.discriminator, `Discriminator`)}
${exists(user.bot), `Bot ?: `}
${exists(user.system), `System ?: `}
${exists(user.createdAt), `Created at: `}
${exists(user.createdTimestamp), `Created timestamp: `}
${exists(user.hexAccentColor), `Accent color: `}
${exists(user.bannerURL(true), `banner`)} 
${exists(user.avatarURL(true), `avatar`)} 
`


				})

				break
			}
			case 'guild': {

			}

		}

	},
}
const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require('discord.js')

function fetchUser(user) {
	return new Promise((resolve, reject) => {
		try {
			resolve(user.fetch(true))
		} catch { reject() }
	})
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
				.addStringOption(option =>
					option.setName('info')
						.setDescription('Information to retrieve')
						.addChoices(
							{ name: 'all', value: 'all' },
							{ name: 'avatar', value: 'avatar' },
							{ name: 'banner', value: 'banner' }
						)
				))
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
					switch (interaction.options.getString('info') || 'all') {
						case 'all': {
							avatar = user.avatarURL(true)
							if (avatar) {
								avatar = `Avatar: ${avatar}?size=4096`
							} else {
								avatar = `No avatar found`
							}
							banner = user.bannerURL(true)
							if (banner) {
								banner = `Banner: ${banner}?size=4096`
							} else {
								banner = `No banner found`
							}

							info = `ID: ${user.id}
Username: ${user.username}
Discriminator: ${user.discriminator}
Avatar: ${user.avatar}
Bot?: ${user.bot}
System?: ${user.system}
Accent Color: ${user.hexAccentColor}
Banner: ${avatar}
Avatar: ${banner}`
							break
						}
						case 'avatar': {
							avatar = user.avatarURL(true)
							if (avatar) {
								info = `Avatar: ${avatar}?size=4096`
							} else {
								info = `No avatar found`
							}
							break
						}
						case 'banner': {
							banner = user.bannerURL(true)
							if (banner) {
								info = `Banner: ${banner}?size=4096`
							} else {
								info = `No banner found`
							}
							break
						}

						default: {
							info = `An error occured. Invalid option?`
							break
						}
					}
					interaction.reply(info)

				})


				break
			}
			case 'guild': {
			}

		}

	},
}
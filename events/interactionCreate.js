const { EmbedBuilder } = require('discord.js')
const embeds = require('../structure/embeds')
const { permissions } = require('../config.json')

// Emitted when an interaction is created.
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`)
		if (!interaction.isChatInputCommand()) return
		//console.log(interaction)

		// gets the command from the file
		const command = interaction.client.commands.get(interaction.commandName)

		if (!command) return

		try {
			if (command.permission == `botowner` && interaction.user.id != permissions[command.permission]) throw `You don't have permission to perform this command\nRequired permission: *${command.permission}*`
			await command.execute(interaction) // trys to run the command
		} catch (error) {
			console.error(error)
			interaction.reply({ embeds: embeds.errorEmbed(`Running command **${interaction.commandName}**`, error), ephemeral: true })
			//await interaction.reply({ content: `There was an error while executing this command!\nError- ${JSON.stringify(error)}`, ephemeral: true })
		}
	},
}


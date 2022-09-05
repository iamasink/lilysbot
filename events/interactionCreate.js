const { EmbedBuilder } = require('discord.js')
const embeds = require('../structure/embeds')


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
			await command.execute(interaction) // trys to run the command
		} catch (error) {
			console.error(error)
			interaction.reply({ embeds: embeds.errorEmbed(`Running command **${interaction.commandName}**`, error), ephemeral: true })
			//await interaction.reply({ content: `There was an error while executing this command!\nError- ${JSON.stringify(error)}`, ephemeral: true })
		}
	},
}


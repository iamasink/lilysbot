const { SlashCommandBuilder } = require('discord.js')
const embeds = require('../../structure/embeds')
const commands = require('../../structure/commands')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('text')
		.setDescription('a!')
		.addStringOption(option => option
			.setName('text')
			.setDescription('a!')

		),
	async execute(interaction) {
		parsed = await commands.textParser(interaction.options.getString('text'), interaction.id, interaction.channelId, interaction.guildId, interaction.user)
		text = JSON.stringify(parsed)
		console.log(parsed)


		//await interaction.reply(text)
		command = interaction.client.commands.get(parsed.name)


		console.log(`aaaa command: ${command}`)
		await command.execute(parsed)
	},
}
